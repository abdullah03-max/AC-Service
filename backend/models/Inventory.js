const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Filter', 'Gas', 'Refrigerant', 'Compressor', 'Motor', 'Capacitor', 'PCB', 'Pipe', 'Wire', 'Other'],
      required: true,
    },
    sku: { type: String, unique: true },
    description: { type: String },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, enum: ['piece', 'kg', 'liter', 'meter', 'set'], default: 'piece' },
    minStockLevel: { type: Number, default: 5 },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    supplier: { type: String },
    location: { type: String, comment: 'Storage location in warehouse' },
    isActive: { type: Boolean, default: true },
    usageHistory: [
      {
        booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        quantityUsed: Number,
        usedAt: { type: Date, default: Date.now },
        usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
      },
    ],
    restockHistory: [
      {
        quantity: Number,
        restockedAt: { type: Date, default: Date.now },
        supplier: String,
        cost: Number,
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate SKU
InventorySchema.pre('save', async function (next) {
  if (!this.sku) {
    const count = await mongoose.model('Inventory').countDocuments();
    this.sku = `INV-${String(count + 1001).padStart(4, '0')}`;
  }
  next();
});

// Virtual: isLowStock
InventorySchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.minStockLevel;
});

InventorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Inventory', InventorySchema);
