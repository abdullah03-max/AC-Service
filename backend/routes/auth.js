const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, getUsers, sendOTP, verifyOTP, deleteUser, toggleUserStatus } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/changepassword', protect, changePassword);
router.get('/users', protect, authorize('admin'), getUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.put('/users/:id/status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
