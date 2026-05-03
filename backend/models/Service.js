const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Service name required'], trim: true },
    category: {
      type: String,
      enum: ['Cleaning', 'Repair', 'Installation', 'Gas Charging', 'Maintenance', 'Inspection'],
      required: true,
    },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, comment: 'Duration in minutes' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    inventoryRequired: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
        quantity: { type: Number, default: 1 },
      },
    ],
    tags: [String],
    bookingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', ServiceSchema);
