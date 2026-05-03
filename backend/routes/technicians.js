const express = require('express');
const router = express.Router();
const {
  getTechnicians, getTechnician, getMyProfile, createTechnician, updateTechnician, updateLocation, updateStatus, deleteTechnician, getLiveTracking
} = require('../controllers/technicianController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getTechnicians);
router.get('/live/tracking', protect, authorize('admin'), getLiveTracking);
router.get('/profile/me', protect, authorize('technician'), getMyProfile);
router.get('/:id', protect, getTechnician);
router.post('/', protect, authorize('admin'), createTechnician);
router.put('/location', protect, authorize('technician'), updateLocation);
router.put('/status', protect, authorize('technician'), updateStatus);
router.put('/:id', protect, authorize('admin'), updateTechnician);
router.delete('/:id', protect, authorize('admin'), deleteTechnician);

module.exports = router;
