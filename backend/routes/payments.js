const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');

// @desc Initiate payment (placeholder for JazzCash/EasyPaisa)
// @route POST /api/payments/initiate
router.post('/initiate', protect, async (req, res) => {
  const { bookingId, method } = req.body;
  const booking = await Booking.findById(bookingId).populate('service', 'name price');

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (method === 'cash') {
    return res.json({ success: true, message: 'Cash on Delivery selected. Pay when technician arrives.', data: { method: 'cash', status: 'pending' } });
  }

  // Placeholder for JazzCash / EasyPaisa integration
  const mockPaymentUrl = `https://sandbox.jazzcash.com.pk/payment?ref=${booking.bookingNumber}&amount=${booking.totalAmount}`;

  res.json({
    success: true,
    message: `${method} payment initiated (sandbox mode)`,
    data: {
      method,
      paymentUrl: mockPaymentUrl,
      amount: booking.totalAmount,
      reference: booking.bookingNumber,
      note: 'This is a sandbox payment. Integrate with actual JazzCash/EasyPaisa SDK for production.',
    },
  });
});

// @desc Get invoice for booking
// @route GET /api/payments/invoice/:bookingId
router.get('/invoice/:bookingId', protect, async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId)
    .populate('service', 'name category price duration')
    .populate('user', 'name email phone address')
    .populate({ path: 'technician', populate: { path: 'user', select: 'name phone' } });

  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  const invoice = {
    invoiceNumber: `INV-${booking.bookingNumber}`,
    issuedTo: booking.user,
    issuedBy: 'Full Care AC Tech',
    bookingNumber: booking.bookingNumber,
    service: booking.service,
    technician: booking.technician,
    scheduledDate: booking.scheduledDate,
    scheduledTime: booking.scheduledTime,
    address: booking.address,
    items: booking.invoice?.items || [{ description: `${booking.service?.name} Service`, amount: booking.totalAmount }],
    subtotal: booking.totalAmount,
    tax: booking.invoice?.tax || 0,
    discount: booking.invoice?.discount || 0,
    total: booking.totalAmount,
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentStatus,
    generatedAt: booking.invoice?.generatedAt || new Date(),
  };

  res.json({ success: true, data: invoice });
});

module.exports = router;
