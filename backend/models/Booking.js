const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    bookingNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, default: 'Karachi' },
    acType: { type: String, enum: ['Split', 'Window', 'Cassette', 'Portable', 'Central'], default: 'Split' },
    acBrand: { type: String },
    acTons: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, enum: ['cash', 'jazzcash', 'easypaisa', 'card'], default: 'cash' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    totalAmount: { type: Number, required: true },
    notes: { type: String },
    technicianNotes: { type: String },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
    invoice: {
      generated: { type: Boolean, default: false },
      generatedAt: Date,
      items: [{ description: String, amount: Number }],
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
    },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    completedAt: Date,
  },
  { timestamps: true }
);

// Auto-generate booking number
BookingSchema.pre('save', async function (next) {
  if (!this.bookingNumber) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingNumber = `FCAC-${String(count + 1001).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
