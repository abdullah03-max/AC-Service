const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @desc Get user notifications
router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('notifications');
  res.json({ success: true, data: user.notifications.sort((a, b) => b.createdAt - a.createdAt) });
});

// @desc Mark notification as read
router.put('/:notifId/read', protect, async (req, res) => {
  await User.updateOne(
    { _id: req.user.id, 'notifications._id': req.params.notifId },
    { $set: { 'notifications.$.read': true } }
  );
  res.json({ success: true, message: 'Marked as read' });
});

// @desc Mark all as read
router.put('/read-all', protect, async (req, res) => {
  await User.updateOne({ _id: req.user.id }, { $set: { 'notifications.$[].read': true } });
  res.json({ success: true, message: 'All marked as read' });
});

module.exports = router;
