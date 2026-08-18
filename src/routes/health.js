const express = require('express');
const db = require('../db');

const router = express.Router();

// Basic health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'voteweb-api',
    timestamp: new Date().toISOString(),
  });
});

// Database health check
router.get('/health/db', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    res.json({
      status: 'ok',
      database: 'postgresql',
      ...dbHealth,
    });
  } catch (err) {
    console.error('Database health check failed:', err.message);
    res.status(503).json({
      status: 'error',
      database: 'postgresql',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
