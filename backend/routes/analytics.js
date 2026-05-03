const express = require('express');
const router = express.Router();
const { getDashboard, getRevenueAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin'), getDashboard);
router.get('/revenue', protect, authorize('admin'), getRevenueAnalytics);

module.exports = router;
