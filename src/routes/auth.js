/**
 * Authentication Routes
 * Handles login, logout, MFA, and password management
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { loadSession } = require('../middleware/loadSession');
const { requireAuth } = require('../middleware/requireAuth');
const { csrfProtection } = require('../middleware/csrfProtection');
const { loginLimiter, mfaLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { hashPassword, verifyPassword, validatePasswordPolicy } = require('../lib/password');
const { verifyTotp, generateTotpSecret, provisioningUri } = require('../lib/totp');
const { encryptSecret, decryptSecret, hashToken } = require('../lib/crypto');
const { mintCsrfToken, CSRF_COOKIE } = require('../lib/cookies');
const { createSession, revokeSession, rotateSession } = require('../services/sessionService');
const { createMfaChallenge, findChallenge, deleteChallenge, incrementChallengeAttempts } = require('../services/mfaService');
const { recordAudit, findStudentByIdentifierOrEmail, updateStudentLogin, incrementFailedLogin } = require('../lib/authDb');
const config = require('../config');

// Helper function to create error response
function authError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

// Helper to get public user data (without sensitive fields)
function publicUser(student) {
  return {
    id: student.id,
    externalId: student.external_id,
    name: student.name,
    email: student.email,
    role: student.role,
    requiresPasswordChange: student.password_change_required,
  };
}

// Check if account is locked
function isLocked(student) {
  return student?.locked_until && new Date(student.locked_until).getTime() > Date.now();
}

// =====================================================
// CSRF TOKEN
// =====================================================

/**
 * GET /api/v1/auth/csrf
 * Returns CSRF token for form submissions
 */
router.get('/csrf', (req, res) => {
  const token = mintCsrfToken();
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false, // Must be readable by JavaScript for double-submit
    secure: config.cookieSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  res.json({ data: { csrfToken: token } });
});

// =====================================================
// CURRENT USER
// =====================================================

/**
 * GET /api/v1/auth/me
 * Returns current authenticated user info
 */
router.get('/me', loadSession, (req, res) => {
  if (!req.user) {
    return res.json({ authenticated: false });
  }
  return res.json({
    authenticated: true,
    requiresPasswordChange: req.user.passwordChangeRequired,
    user: publicUser(req.user),
  });
});

// =====================================================
// LOGIN
// =====================================================

/**
 * POST /api/v1/auth/login
 * Authenticate user with credentials
 */
router.post('/login', loginLimiter, csrfProtection, async (req, res) => {
  try {
    const { userIdentifier, password } = req.body;

    // Validate input
    if (!userIdentifier || typeof userIdentifier !== 'string' || userIdentifier.trim().length < 3) {
      return authError(res, 400, 'INVALID_INPUT', 'User identifier is required (min 3 characters).');
    }

    if (!password || typeof password !== 'string' || password.length < 1) {
      return authError(res, 400, 'INVALID_INPUT', 'Password is required.');
    }

    // Find student by identifier or email
    const student = await findStudentByIdentifierOrEmail(userIdentifier.trim());

    // Check if account is locked
    if (isLocked(student)) {
      await recordAudit('login_locked', {
        studentId: student?.id,
        ip: req.ip,
        metadata: { identifier: userIdentifier },
      });
      return authError(res, 423, 'ACCOUNT_LOCKED', 'This account is temporarily locked. Please try again later.');
    }

    // Verify password
    const valid = student ? await verifyPassword(password, student.password_hash) : false;

    if (!student || !valid) {
      if (student) {
        await incrementFailedLogin(student);
      }
      await recordAudit('login_failed', {
        studentId: student?.id,
        ip: req.ip,
        metadata: { identifier: userIdentifier },
      });
      return authError(res, 401, 'INVALID_CREDENTIALS', 'Invalid credentials. Please try again.');
    }

    // Clear failed login attempts
    await updateStudentLogin(student.id);

    // Record successful password verification
    await recordAudit('login_password_verified', {
      studentId: student.id,
      ip: req.ip,
    });

    // Admin users require MFA (unless DEV_MFA_BYPASS is enabled in development)
    if (student.role === 'ADMIN') {
      // Development bypass: Allow MFA bypass for testing
      if (!config.isProduction && process.env.DEV_MFA_BYPASS === 'true') {
        const bindingToken = await createSession(res, student.id, true);
        await recordAudit('login_completed', {
          studentId: student.id,
          ip: req.ip,
          metadata: { method: 'mfa_bypass' },
        });
        return res.json({
          data: {
            authenticated: true,
            requiresPasswordChange: student.password_change_required,
            bindingToken,
            user: publicUser(student),
          },
        });
      }

      const requiresMfaSetup = !student.mfa_enabled;

      // Create MFA challenge
      const challenge = await createMfaChallenge(student.id, requiresMfaSetup);

      return res.json({
        data: {
          authenticated: false,
          mfaRequired: true,
          requiresMfaSetup,
          mfaChallenge: challenge.challenge,
          enrollmentToken: challenge.enrollmentToken || undefined,
        },
      });
    }

    // Non-admin users get session directly
    const bindingToken = await createSession(res, student.id, false);

    await recordAudit('login_completed', {
      studentId: student.id,
      ip: req.ip,
    });

    return res.json({
      data: {
        authenticated: true,
        requiresPasswordChange: student.password_change_required,
        bindingToken,
        user: publicUser(student),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return authError(res, 500, 'INTERNAL_ERROR', 'An error occurred during login.');
  }
});

// =====================================================
// LOGOUT
// =====================================================

/**
 * POST /api/v1/auth/logout
 * End user session
 */
router.post('/logout', csrfProtection, async (req, res) => {
  try {
    await revokeSession(req, res);
    if (req.user) {
      await recordAudit('logout', {
        studentId: req.user.id,
        ip: req.ip,
      });
    }
    return res.json({ data: { message: 'Logged out successfully.' } });
  } catch (error) {
    console.error('Logout error:', error);
    return authError(res, 500, 'INTERNAL_ERROR', 'An error occurred during logout.');
  }
});

// =====================================================
// MFA VERIFICATION
// =====================================================

/**
 * POST /api/v1/auth/mfa/verify
 * Verify MFA code for admin users
 */
router.post('/mfa/verify', mfaLimiter, csrfProtection, async (req, res) => {
  try {
    const { mfaChallenge, code } = req.body;

    // Validate input
    if (!mfaChallenge || typeof mfaChallenge !== 'string' || mfaChallenge.length < 20) {
      return authError(res, 400, 'INVALID_INPUT', 'Invalid MFA challenge.');
    }

    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return authError(res, 400, 'INVALID_INPUT', 'MFA code must be 6 digits.');
    }

    // Find challenge
    const challenge = await findChallenge(mfaChallenge);

    if (!challenge || challenge.attempts >= 5 || !challenge.mfa_secret_encrypted) {
      return authError(res, 401, 'MFA_INVALID', 'Invalid or expired MFA challenge.');
    }

    // Verify TOTP code
    const secret = decryptSecret(challenge.mfa_secret_encrypted);
    if (!verifyTotp(secret, code)) {
      await incrementChallengeAttempts(challenge.id);
      await recordAudit('mfa_failed', {
        studentId: challenge.student_id,
        ip: req.ip,
      });
      return authError(res, 401, 'MFA_INVALID', 'Invalid verification code.');
    }

    // Delete challenge and create session
    await deleteChallenge(challenge.id);
    const bindingToken = await createSession(res, challenge.student_id, true);

    // Update last login
    await updateStudentLogin(challenge.student_id);

    await recordAudit('login_completed', {
      studentId: challenge.student_id,
      ip: req.ip,
      metadata: { method: 'mfa' },
    });

    // Get student data for response
    const student = await findStudentByIdentifierOrEmail(challenge.external_id);

    return res.json({
      data: {
        authenticated: true,
        bindingToken,
        user: publicUser(student),
      },
    });
  } catch (error) {
    console.error('MFA verify error:', error);
    return authError(res, 500, 'INTERNAL_ERROR', 'An error occurred during MFA verification.');
  }
});

// =====================================================
// MFA SETUP
// =====================================================

/**
 * POST /api/v1/auth/mfa/setup
 * Start or continue MFA enrollment
 */
router.post('/mfa/setup', mfaLimiter, csrfProtection, async (req, res) => {
  try {
    const { mfaChallenge, enrollmentToken } = req.body;

    // Validate input
    if (!mfaChallenge || typeof mfaChallenge !== 'string' || mfaChallenge.length < 20) {
      return authError(res, 400, 'INVALID_INPUT', 'Invalid MFA challenge.');
    }

    // Find challenge
    const challenge = await findChallenge(mfaChallenge);

    if (!challenge) {
      return authError(res, 401, 'MFA_INVALID', 'Invalid or expired MFA challenge.');
    }

    // Only enrollment challenges can be used to set up MFA.
    // Prevents a fresh login challenge from silently replacing an existing MFA secret.
    if (!challenge.enrollment_hash) {
      return authError(res, 401, 'MFA_INVALID', 'MFA is already configured.');
    }

    // The enrollment token was issued with the challenge at login and acts as
    // the bearer credential for first-time enrollment.
    if (!enrollmentToken || typeof enrollmentToken !== 'string' || enrollmentToken.length < 20) {
      return authError(res, 400, 'INVALID_INPUT', 'Enrollment token is required.');
    }

    if (challenge.enrollment_hash !== hashToken(enrollmentToken)) {
      return authError(res, 401, 'MFA_INVALID', 'Invalid enrollment token.');
    }

    // Check if pending secret exists (resume enrollment)
    if (challenge.pending_secret_encrypted) {
      const secret = decryptSecret(challenge.pending_secret_encrypted);
      return res.json({
        data: {
          secret,
          provisioningUri: provisioningUri(secret, challenge.external_id),
        },
      });
    }

    // Generate new TOTP secret
    const secret = generateTotpSecret();

    await db.query(
      'UPDATE mfa_challenges SET pending_secret_encrypted = $1 WHERE id = $2',
      [encryptSecret(secret), challenge.id],
    );

    return res.json({
      data: {
        secret,
        provisioningUri: provisioningUri(secret, challenge.external_id),
      },
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    return authError(res, 500, 'INTERNAL_ERROR', 'An error occurred during MFA setup.');
  }
});

/**
 * POST /api/v1/auth/mfa/verify-setup
 * Verify MFA setup with TOTP code
 */
router.post('/mfa/verify-setup', mfaLimiter, csrfProtection, async (req, res) => {
  try {
    const { mfaChallenge, enrollmentToken, code } = req.body;

    // Validate input
    if (!mfaChallenge || typeof mfaChallenge !== 'string' || mfaChallenge.length < 20) {
      return authError(res, 400, 'INVALID_INPUT', 'Invalid MFA challenge.');
    }

    if (!enrollmentToken || typeof enrollmentToken !== 'string' || enrollmentToken.length < 20) {
      return authError(res, 400, 'INVALID_INPUT', 'Enrollment token is required.');
    }

    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return authError(res, 400, 'INVALID_INPUT', 'MFA code must be 6 digits.');
    }

    // Find challenge
    const challenge = await findChallenge(mfaChallenge);

    if (!challenge || challenge.attempts >= 5 || !challenge.pending_secret_encrypted) {
      return authError(res, 401, 'MFA_INVALID', 'Invalid or expired MFA enrollment.');
    }

    // The enrollment token acts as the bearer credential for first-time enrollment.
    if (!challenge.enrollment_hash || challenge.enrollment_hash !== hashToken(enrollmentToken)) {
      return authError(res, 401, 'MFA_INVALID', 'Invalid enrollment token.');
    }

    // Verify TOTP code
    const secret = decryptSecret(challenge.pending_secret_encrypted);
    if (!verifyTotp(secret, code)) {
      await incrementChallengeAttempts(challenge.id);
      return authError(res, 401, 'MFA_INVALID', 'Invalid verification code.');
    }

    // Enable MFA for user
    await db.query(
      'UPDATE students SET mfa_enabled = TRUE, mfa_secret_encrypted = $1, updated_at = NOW() WHERE id = $2',
      [encryptSecret(secret), challenge.student_id],
    );

    // Delete challenge
    await deleteChallenge(challenge.id);

    // Create session with MFA verified
    const bindingToken = await createSession(res, challenge.student_id, true);

    await recordAudit('mfa_enrolled', {
      studentId: challenge.student_id,
      ip: req.ip,
    });

    // Get student for response
    const student = await findStudentByIdentifierOrEmail(challenge.external_id);

    return res.json({
      data: {
        authenticated: true,
        bindingToken,
        user: publicUser(student),
      },
    });
  } catch (error) {
    console.error('MFA verify-setup error:', error);
    return authError(res, 500, 'INTERNAL_ERROR', 'An error occurred during MFA verification.');
  }
});

// =====================================================
// PASSWORD CHANGE
// =====================================================

/**
 * POST /api/v1/auth/change-password
 * Change password for authenticated user
 */
router.post('/change-password', loadSession, requireAuth, csrfProtection, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || typeof currentPassword !== 'string') {
      return authError(res, 400, 'INVALID_INPUT', 'Current password is required.');
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return authError(res, 400, 'INVALID_INPUT', 'New password is required.');
    }

    // Get current student
    const student = await findStudentByIdentifierOrEmail(req.user.userIdentifier);

    if (!student) {
      return authError(res, 401, 'AUTH_REQUIRED', 'User not found.');
    }

    // Verify current password
    if (!await verifyPassword(currentPassword, student.password_hash)) {
      return authError(res, 401, 'CURRENT_PASSWORD_INVALID', 'Current password is incorrect.');
    }

    // Validate new password policy
    const policyError = validatePasswordPolicy(newPassword, student.external_id);
    if (policyError) {
      return authError(res, 400, 'PASSWORD_POLICY', policyError);
    }

    // Check new password is different
    if (await verifyPassword(newPassword, student.password_hash)) {
      return authError(res, 400, 'PASSWORD_REUSED', 'New password must be different from current password.');
    }

    // Hash and save new password
    const newHash = await hashPassword(newPassword);
    await db.query(
      'UPDATE students SET password_hash = $1, password_change_required = FALSE, updated_at = NOW() WHERE id = $2',
      [newHash, student.id],
    );

    // Rotate session
    const bindingToken = await rotateSession(req, res, student.id, req.user.mfaVerified);

    await recordAudit('password_changed', {
      studentId: student.id,
      ip: req.ip,
    });

    return res.json({
      data: {
        message: 'Password changed successfully.',
        bindingToken,
      },
    });
  } catch (error) {
    console.error('Password change error:', error);
    return authError(res, 500, 'INTERNAL_ERROR', 'An error occurred during password change.');
  }
});

// =====================================================
// REGISTRATION (for creating new accounts)
// =====================================================

/**
 * POST /api/v1/auth/register
 * Request new account registration
 */
router.post('/register', registerLimiter, csrfProtection, async (req, res) => {
  try {
    const { fullName, email, studentIdentifier, password } = req.body;

    // Validate input
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return authError(res, 400, 'INVALID_INPUT', 'Full name is required (min 2 characters).');
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return authError(res, 400, 'INVALID_INPUT', 'Valid email is required.');
    }

    if (!studentIdentifier || typeof studentIdentifier !== 'string' || studentIdentifier.trim().length < 3) {
      return authError(res, 400, 'INVALID_INPUT', 'Student identifier is required (min 3 characters).');
    }

    if (!password || typeof password !== 'string') {
      return authError(res, 400, 'INVALID_INPUT', 'Password is required.');
    }

    // Validate password policy
    const policyError = validatePasswordPolicy(password, studentIdentifier);
    if (policyError) {
      return authError(res, 400, 'PASSWORD_POLICY', policyError);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Check if student identifier already exists
    const existing = await findStudentByIdentifierOrEmail(studentIdentifier.trim());
    if (existing) {
      return authError(res, 400, 'DUPLICATE_IDENTIFIER', 'This student identifier is already registered.');
    }

    // Create registration request (admin approval required)
    await db.query(
      `INSERT INTO registration_requests (full_name, email, student_identifier, password_hash)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [fullName.trim(), email.toLowerCase(), studentIdentifier.trim(), passwordHash],
    );

    await recordAudit('registration_requested', {
      ip: req.ip,
      metadata: { studentIdentifier: studentIdentifier.trim() },
    });

    return res.status(202).json({
      data: {
        message: 'Registration submitted for administrator approval.',
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return authError(res, 500, 'INTERNAL_ERROR', 'An error occurred during registration.');
  }
});

module.exports = router;
