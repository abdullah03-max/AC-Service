const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Technician = require('../models/Technician');
const Inventory = require('../models/Inventory');
const emailService = require('../utils/emailService');

// @desc Get all bookings (admin) / user's bookings
// @route GET /api/bookings
exports.getBookings = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Booking.find();
    } else if (req.user.role === 'technician') {
      const tech = await Technician.findOne({ user: req.user.id });
      query = Booking.find({ technician: tech?._id });
    } else {
      query = Booking.find({ user: req.user.id });
    }

    const bookings = await query
      .populate('service', 'name category price image')
      .populate('user', 'name email phone')
      .populate({ path: 'technician', populate: { path: 'user', select: 'name phone' } })
      .sort('-createdAt');

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) { next(err); }
};

// @desc Get single booking
// @route GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('user', 'name email phone address')
      .populate({ path: 'technician', populate: { path: 'user', select: 'name phone' } });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only owner, admin, or assigned technician can view
    const isTech = req.user.role === 'technician';
    const isOwner = booking.user._id.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin' && !isTech)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @desc Create booking
// @route POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const { serviceId, scheduledDate, scheduledTime, address, city, acType, acBrand, acTons, paymentMethod, notes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) return res.status(404).json({ success: false, message: 'Service not found' });

    const booking = await Booking.create({
      user: req.user.id,
      service: serviceId,
      scheduledDate,
      scheduledTime,
      address,
      city,
      acType,
      acBrand,
      acTons,
      paymentMethod,
      notes,
      totalAmount: service.price,
      statusHistory: [{ status: 'pending', updatedBy: req.user.id, note: 'Booking created' }],
    });

    // Update service booking count
    await Service.findByIdAndUpdate(serviceId, { $inc: { bookingCount: 1 } });

    // Update user last service & history
    await User.findByIdAndUpdate(req.user.id, {
      lastService: new Date(),
      $push: { bookingHistory: booking._id, notifications: { message: `Booking ${booking.bookingNumber} confirmed!`, type: 'success' } },
    });

    // Notify all admins about new booking
    await User.updateMany(
      { role: 'admin' },
      { $push: { notifications: { message: `New booking request #${booking.bookingNumber} received.`, type: 'info' } } }
    );

    const populated = await booking.populate('service', 'name category price');
    
    // Send Email Notification
    const user = await User.findById(req.user.id);
    emailService.sendBookingConfirmation(user, populated);

    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

// @desc Update booking status
// @route PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.status = status;
    booking.statusHistory.push({ status, updatedBy: req.user.id, note: note || '' });

    if (status !== 'completed' && status !== 'pending') {
      await User.findByIdAndUpdate(booking.user, {
        $push: { notifications: { message: `Your booking ${booking.bookingNumber} status is now: ${status.replace('_', ' ')}.`, type: 'info' } }
      });
    }

    if (status === 'completed') {
      booking.completedAt = new Date();
      booking.paymentStatus = booking.paymentMethod === 'cash' ? 'paid' : 'paid';
      booking.invoice = {
        generated: true,
        generatedAt: new Date(),
        items: [{ description: 'Service Charge', amount: booking.totalAmount }],
        tax: 0,
        discount: 0,
      };

      // Deduct inventory if service has required items
      const service = await Service.findById(booking.service).populate('inventoryRequired.item');
      for (const req of service.inventoryRequired || []) {
        await Inventory.findByIdAndUpdate(req.item._id, {
          $inc: { quantity: -req.quantity },
          $push: { usageHistory: { booking: booking._id, quantityUsed: req.quantity, usedBy: booking.technician } },
        });
      }

      // Update technician completed jobs
      if (booking.technician) {
        await Technician.findByIdAndUpdate(booking.technician, {
          $inc: { completedJobs: 1 },
          currentStatus: 'available',
          $pull: { assignedBookings: booking._id },
        });
      }

      // Notify user
      await User.findByIdAndUpdate(booking.user, {
        $push: { notifications: { message: `Your booking ${booking.bookingNumber} is completed!`, type: 'success' } },
      });
    }

    await booking.save();

    // Send Email Notification for status update
    const userForEmail = await User.findById(booking.user);
    const populatedBooking = await booking.populate('service', 'name');
    emailService.sendBookingStatusUpdate(userForEmail, populatedBooking, status);

    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @desc Assign technician to booking
// @route PUT /api/bookings/:id/assign
exports.assignTechnician = async (req, res, next) => {
  try {
    const { technicianId } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        technician: technicianId,
        status: 'assigned',
        $push: { statusHistory: { status: 'assigned', updatedBy: req.user.id, note: 'Technician assigned' } },
      },
      { new: true }
    );

    const tech = await Technician.findByIdAndUpdate(technicianId, {
      currentStatus: 'on_job',
      $push: { assignedBookings: booking._id },
    });

    if (tech && tech.user) {
      await User.findByIdAndUpdate(tech.user, {
        $push: { notifications: { message: `You have been assigned a new job: #${booking.bookingNumber}.`, type: 'info' } }
      });
    }
    
    // Send Email Notification to User
    const userForEmail = await User.findById(booking.user);
    const populatedBooking = await booking.populate('service', 'name');
    const techWithUser = await tech.populate('user', 'name phone');
    emailService.sendBookingStatusUpdate(userForEmail, populatedBooking, 'assigned', techWithUser);

    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @desc Cancel booking
// @route PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (['completed', 'cancelled'].includes(booking.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });

    booking.status = 'cancelled';
    booking.statusHistory.push({ status: 'cancelled', updatedBy: req.user.id });
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) { next(err); }
};

// @desc Get smart recommendations based on user history
// @route GET /api/bookings/recommendations
exports.getRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userBookings = await Booking.find({ user: req.user.id, status: 'completed' })
      .populate('service', 'category')
      .sort('-completedAt')
      .limit(10);

    const categoryCounts = {};
    userBookings.forEach(b => {
      const cat = b.service?.category;
      if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Recommend services not recently booked, sorted by popularity
    const recommendations = await Service.find({ isActive: true }).sort('-bookingCount').limit(6);

    const daysSinceLastService = user.lastService
      ? Math.floor((Date.now() - new Date(user.lastService)) / (1000 * 60 * 60 * 24))
      : null;

    res.json({
      success: true,
      data: {
        recommendations,
        daysSinceLastService,
        mostBookedCategory: Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0],
        message: daysSinceLastService && daysSinceLastService > 90
          ? 'Your AC is due for maintenance! Book a cleaning or inspection.'
          : 'Explore our popular services.',
      },
    });
  } catch (err) { next(err); }
};

// @desc Submit feedback for a completed booking
// @route PUT /api/bookings/:id/feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    // Only the user who made the booking can submit feedback
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only provide feedback for completed services' });
    }

    if (booking.rating) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted' });
    }

    booking.rating = rating;
    booking.review = review;
    await booking.save();

    // Update technician aggregate rating
    if (booking.technician) {
      const tech = await Technician.findById(booking.technician);
      if (tech) {
        const totalRating = tech.rating * tech.totalReviews + rating;
        tech.totalReviews += 1;
        tech.rating = (totalRating / tech.totalReviews).toFixed(1);
        await tech.save();
      }
    }

    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};
