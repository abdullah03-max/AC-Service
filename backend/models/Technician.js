const mongoose = require('mongoose');

const TechnicianSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, unique: true },
    specializations: [{ type: String, enum: ['Cleaning', 'Repair', 'Installation', 'Gas Charging', 'Maintenance'] }],
    experience: { type: Number, default: 0, comment: 'Years of experience' },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    currentLocation: {
      lat: { type: Number, default: 24.8607 },
      lng: { type: Number, default: 67.0011 },
      lastUpdated: { type: Date, default: Date.now },
    },
    currentStatus: {
      type: String,
      enum: ['available', 'on_job', 'offline', 'break'],
      default: 'available',
    },
    assignedBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    completedJobs: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
    },
    daysOff: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    salary: { type: Number },
    joiningDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-generate employee ID
TechnicianSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Technician').countDocuments();
    this.employeeId = `TECH-${String(count + 101).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Technician', TechnicianSchema);
