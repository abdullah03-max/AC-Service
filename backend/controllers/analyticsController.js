const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const Technician = require('../models/Technician');
const Inventory = require('../models/Inventory');

// @desc Admin analytics dashboard data
// @route GET /api/analytics/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total counts
    const [totalBookings, totalUsers, totalTechnicians, totalServices] = await Promise.all([
      Booking.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Technician.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
    ]);

    // Revenue this month
    const revenueThisMonth = await Booking.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Revenue last month
    const revenueLastMonth = await Booking.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Monthly bookings (last 6 months)
    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Popular services
    const popularServices = await Service.find({ isActive: true }).sort('-bookingCount').limit(5).select('name category bookingCount price');

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name')
      .populate('service', 'name category')
      .sort('-createdAt')
      .limit(10);

    // Low stock items
    const inventory = await Inventory.find({ isActive: true });
    const lowStockItems = inventory.filter(i => i.quantity <= i.minStockLevel);

    res.json({
      success: true,
      data: {
        summary: {
          totalBookings,
          totalUsers,
          totalTechnicians,
          totalServices,
          revenueThisMonth: revenueThisMonth[0]?.total || 0,
          revenueLastMonth: revenueLastMonth[0]?.total || 0,
        },
        bookingsByStatus,
        monthlyBookings,
        popularServices,
        recentBookings,
        lowStockItems,
      },
    });
  } catch (err) { next(err); }
};

// @desc Revenue analytics
// @route GET /api/analytics/revenue
exports.getRevenueAnalytics = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;

    const groupBy = period === 'daily'
      ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }
      : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };

    const revenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: groupBy, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, data: revenue });
  } catch (err) { next(err); }
};
