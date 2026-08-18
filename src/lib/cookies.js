/**
 * Cookie Utilities
 * CommonJS implementation based on voteweb-auth/src/cookies.js
 * Provides secure cookie handling for sessions and CSRF tokens
 */

const { randomBytes } = require('node:crypto');
const config = require('../config');

// Cookie names
const SESSION_COOKIE = 'cv_sid';
const CSRF_COOKIE = 'cv_csrf';

/**
 * Get cookie options based on type
 * @param {boolean} httpOnly - Whether cookie should be HttpOnly
 * @returns {object} - Cookie options object
 */
function cookieOptions(httpOnly) {
  return {
    httpOnly,
    secure: config.cookieSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: httpOnly ? config.sessionTtlMs : 60 * 60 * 1000, // 1 hour for CSRF
  };
}

/**
 * Generate a random CSRF token
 * @returns {string} - Base64url-encoded random token
 */
function mintCsrfToken() {
  return randomBytes(32).toString('base64url');
}

/**
 * Set session cookie on response
 * @param {object} response - Express response object
 * @param {string} token - Session token
 */
function setSessionCookie(response, token) {
  response.cookie(SESSION_COOKIE, token, cookieOptions(true));
}

/**
 * Clear session cookie
 * @param {object} response - Express response object
 */
function clearSessionCookie(response) {
  response.clearCookie(SESSION_COOKIE, { ...cookieOptions(true), maxAge: undefined });
}

module.exports = {
  SESSION_COOKIE,
  CSRF_COOKIE,
  cookieOptions,
  mintCsrfToken,
  setSessionCookie,
  clearSessionCookie,
};
