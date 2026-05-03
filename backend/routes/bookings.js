const express = require('express');
const router = express.Router();
const {
  getBookings, getBooking, createBooking, updateBookingStatus, assignTechnician, cancelBooking, getRecommendations
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/recommendations', protect, getRecommendations);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBooking);
router.post('/', protect, authorize('user', 'admin'), createBooking);
router.put('/:id/status', protect, authorize('admin', 'technician'), updateBookingStatus);
router.put('/:id/assign', protect, authorize('admin'), assignTechnician);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
