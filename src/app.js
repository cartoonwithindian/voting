const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const healthRoutes = require('./routes/health');
const studentRoutes = require('./routes/students');
const electionRoutes = require('./routes/elections');
const announcementRoutes = require('./routes/announcements');
const clubRoutes = require('./routes/clubs');
const positionRoutes = require('./routes/positions');
const candidateRoutes = require('./routes/candidates');
const authorizationRoutes = require('./routes/authorization');
const authRoutes = require('./routes/auth');
const clubController = require('./controllers/clubController');
const positionController = require('./controllers/positionController');
const candidateController = require('./controllers/candidateController');
const authController = require('./controllers/authorizationController');
const voteController = require('./controllers/voteController');
const adminStudents = require('./routes/adminStudents');
const adminElections = require('./routes/adminElections');
const adminClubs = require('./routes/adminClubs');
const adminPositions = require('./routes/adminPositions');
const adminCandidates = require('./routes/adminCandidates');
const adminAuthorization = require('./routes/adminAuthorization');
const adminAnnouncements = require('./routes/adminAnnouncements');
const adminSupport = require('./routes/adminSupport');
const voteRoutes = require('./routes/votes');
const receiptRoutes = require('./routes/receipts');
const notificationRoutes = require('./routes/notifications');
const supportRoutes = require('./routes/support');
const { loadSession } = require('./middleware/loadSession');
const { requireAdmin } = require('./middleware/requireAdmin');

const app = express();
const isDev = process.env.NODE_ENV !== 'production';

// Trust the first proxy hop (Render's reverse proxy) so req.ip reflects the
// real client IP. Without this, every user shares the proxy IP and the
// per-IP rate limiters (login, register, voting) become global.
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: isDev ? false : undefined,
}));

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3001')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)
  .concat(['http://10.139.255.165:3001']);

const corsOptions = {
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Session-Binding'],
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parsing
app.use(cookieParser());

// =====================================================
// SESSION LOADING (runs on every request before route handlers)
// =====================================================
app.use(loadSession);

// =====================================================
// PUBLIC ROUTES (no authentication required)
// =====================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'voteweb-api',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health/db', async (req, res) => {
  const db = require('./db');
  const start = Date.now();
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      responseTime: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// Auth routes (login, logout, MFA, etc.)
app.use('/api/v1/auth', authRoutes);

// Elections (public read for published elections)
app.use('/api/v1/elections', electionRoutes);

// Public announcements (published only)
app.use('/api/v1/announcements', announcementRoutes);

// Public election clubs
app.get('/api/v1/elections/:electionId/clubs', clubController.list.bind(clubController));

// Club-position relationships (public read)
app.get('/api/v1/clubs/:clubId/positions', positionController.list.bind(positionController));

// Position-candidate relationships (public read)
app.get('/api/v1/positions/:positionId/candidates', candidateController.list.bind(candidateController));

// Candidates (public read)
app.use('/api/v1/candidates', candidateRoutes);

// Authorization GET endpoint (public read - for authorized students to see their own auth)
app.get('/api/v1/authorizations/:id', authorizationRoutes);

// Receipt verification (public - receipt ID is the secret)
app.use('/api/v1/receipts', receiptRoutes);

// =====================================================
// AUTHENTICATED STUDENT ROUTES (authentication required)
// =====================================================

// Eligibility check - authenticated student checking their own eligibility
app.get('/api/v1/elections/:electionId/eligibility', (req, res, next) => {
  // For authenticated users, check their own eligibility
  // Student ID comes from session
  const studentId = req.user?.studentId;
  if (!studentId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required to check eligibility.',
      code: 'AUTH_REQUIRED',
    });
  }
  // Forward to eligibility check with session-based student ID
  req.params.studentId = studentId;
  authController.checkEligibility(req, res, next);
});

// Voting routes (authenticated, authorization checked separately)
app.use('/api/v1/elections', voteRoutes);

// Notifications (authenticated)
app.use('/api/v1/notifications', notificationRoutes);

// Support requests (authenticated)
app.use('/api/v1/support', supportRoutes);

// =====================================================
// ADMIN ROUTES (authentication + admin role required)
// =====================================================

// Admin routes with requireAdmin middleware (includes auth check + dev bypass for development)
app.use('/api/v1/admin/students', requireAdmin, adminStudents);
app.use('/api/v1/admin/elections', requireAdmin, adminElections);
app.use('/api/v1/admin/clubs', requireAdmin, adminClubs);
app.use('/api/v1/admin/positions', requireAdmin, adminPositions);
app.use('/api/v1/admin/candidates', requireAdmin, adminCandidates);
app.use('/api/v1/admin/authorizations', requireAdmin, adminAuthorization);
app.use('/api/v1/admin/announcements', requireAdmin, adminAnnouncements);
app.use('/api/v1/admin/support', requireAdmin, adminSupport);

// Admin authorization management
app.get('/api/v1/admin/elections/:electionId/authorizations', requireAdmin, authController.list.bind(authController));
app.post('/api/v1/admin/elections/:electionId/authorizations', requireAdmin, authController.create.bind(authController));

// Admin-only: Election readiness check
app.get('/api/v1/admin/elections/:id/readiness', requireAdmin, (req, res, next) => {
  const ElectionController = require('./controllers/electionController');
  const controller = new ElectionController();
  controller.getReadiness.bind(controller)(req, res, next);
});

// =====================================================
// 404 HANDLER
// =====================================================
app.use((req, res) => {
  // Only handle /api routes, let Next.js handle others
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found.`,
      code: 'NOT_FOUND',
    });
  } else {
    // Let Next.js or other handlers deal with non-API routes
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found.`,
      code: 'NOT_FOUND',
    });
  }
});

// =====================================================
// ERROR HANDLER
// =====================================================
app.use((err, req, res, next) => {
  // Log error
  console.error('Error:', err);

  // Don't expose internal errors in production
  const isDev = process.env.NODE_ENV !== 'production';

  // Handle specific error types
  if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON in request body.',
      code: 'INVALID_JSON',
    });
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Origin not allowed by CORS.',
      code: 'CORS_NOT_ALLOWED',
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.status === 404 ? 'Not Found' : 'Internal Server Error',
    message: isDev ? err.message : (err.status >= 500 ? 'An internal server error occurred.' : err.message),
    code: err.code || 'INTERNAL_ERROR',
  });
});

module.exports = app;
