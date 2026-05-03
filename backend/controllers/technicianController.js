const Technician = require('../models/Technician');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc Get all technicians
// @route GET /api/technicians
exports.getTechnicians = async (req, res, next) => {
  try {
    const technicians = await Technician.find({ isActive: true })
      .populate('user', 'name email phone avatar')
      .sort('-rating');
    res.json({ success: true, count: technicians.length, data: technicians });
  } catch (err) { next(err); }
};

// @desc Get all technicians with live location (for admin tracking)
// @route GET /api/technicians/live/tracking
exports.getLiveTracking = async (req, res, next) => {
  try {
    const technicians = await Technician.find({ isActive: true })
      .populate('user', 'name email phone avatar')
      .select('user employeeId specializations experience isAvailable isActive currentLocation currentStatus assignedBookings completedJobs rating totalReviews workingHours daysOff salary joiningDate')
      .sort('-currentLocation.lastUpdated -rating');
    res.json({ success: true, count: technicians.length, data: technicians });
  } catch (err) { next(err); }
};

// @desc Get single technician
// @route GET /api/technicians/:id
exports.getTechnician = async (req, res, next) => {
  try {
    const tech = await Technician.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedBookings');
    if (!tech) return res.status(404).json({ success: false, message: 'Technician not found' });
    res.json({ success: true, data: tech });
  } catch (err) { next(err); }
};

// @desc Get technician profile (for logged-in technician)
// @route GET /api/technicians/profile/me
exports.getMyProfile = async (req, res, next) => {
  try {
    const tech = await Technician.findOne({ user: req.user.id })
      .populate('user', 'name email phone')
      .populate({ path: 'assignedBookings', populate: { path: 'service', select: 'name category' } });
    if (!tech) return res.status(404).json({ success: false, message: 'Technician profile not found' });
    res.json({ success: true, data: tech });
  } catch (err) { next(err); }
};

// @desc Create technician (admin creates user + technician profile)
// @route POST /api/technicians
exports.createTechnician = async (req, res, next) => {
  try {
    const { name, email, password, phone, specializations, experience, salary, workingHours, daysOff } = req.body;

    // Create user with technician role
    const user = await User.create({ name, email, password, phone, role: 'technician' });

    const technician = await Technician.create({
      user: user._id,
      specializations,
      experience,
      salary,
      workingHours,
      daysOff,
    });

    const populated = await technician.populate('user', 'name email phone');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Email already exists' });
    next(err);
  }
};

// @desc Update technician
// @route PUT /api/technicians/:id
exports.updateTechnician = async (req, res, next) => {
  try {
    const tech = await Technician.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tech) return res.status(404).json({ success: false, message: 'Technician not found' });
    res.json({ success: true, data: tech });
  } catch (err) { next(err); }
};

// @desc Update technician location (mock GPS)
// @route PUT /api/technicians/:id/location
exports.updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const tech = await Technician.findOneAndUpdate(
      { user: req.user.id },
      { currentLocation: { lat, lng, lastUpdated: new Date() } },
      { new: true }
    );
    res.json({ success: true, data: tech });
  } catch (err) { next(err); }
};

// @desc Update technician status
// @route PUT /api/technicians/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const tech = await Technician.findOneAndUpdate(
      { user: req.user.id },
      { currentStatus: status, isAvailable: status === 'available' },
      { new: true }
    );
    res.json({ success: true, data: tech });
  } catch (err) { next(err); }
};

// @desc Delete technician
// @route DELETE /api/technicians/:id
exports.deleteTechnician = async (req, res, next) => {
  try {
    const tech = await Technician.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!tech) return res.status(404).json({ success: false, message: 'Technician not found' });
    await User.findByIdAndUpdate(tech.user, { isActive: false });
    res.json({ success: true, message: 'Technician deactivated' });
  } catch (err) { next(err); }
};
