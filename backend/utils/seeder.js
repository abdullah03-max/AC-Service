const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Service = require('../models/Service');
const Technician = require('../models/Technician');
const Booking = require('../models/Booking');
const Inventory = require('../models/Inventory');

const services = [
  { name: 'Deep AC Cleaning', category: 'Cleaning', description: 'Complete deep cleaning of AC unit including coils, filters, and drain pipe. Improves efficiency and air quality.', price: 2500, duration: 90, rating: 4.8, totalReviews: 124, bookingCount: 234, tags: ['popular', 'recommended'], isActive: true },
  { name: 'AC Gas Charging (R-22)', category: 'Gas Charging', description: 'Refill AC refrigerant gas R-22 to restore cooling performance. Includes leak check.', price: 3500, duration: 60, rating: 4.7, totalReviews: 89, bookingCount: 189, tags: ['popular'], isActive: true },
  { name: 'AC Gas Charging (R-410A)', category: 'Gas Charging', description: 'Environment-friendly R-410A refrigerant refill for modern AC units.', price: 4500, duration: 60, rating: 4.6, totalReviews: 67, bookingCount: 145, tags: [], isActive: true },
  { name: 'AC Repair & Diagnosis', category: 'Repair', description: 'Full diagnosis and repair of AC issues including electrical, mechanical, and cooling problems.', price: 1500, duration: 120, rating: 4.5, totalReviews: 203, bookingCount: 312, tags: ['most-booked'], isActive: true },
  { name: 'Split AC Installation', category: 'Installation', description: 'Professional installation of split AC unit including mounting, piping, and electrical connections.', price: 5000, duration: 180, rating: 4.9, totalReviews: 56, bookingCount: 98, tags: ['premium'], isActive: true },
  { name: 'Window AC Installation', category: 'Installation', description: 'Expert installation of window AC with proper sealing and electrical setup.', price: 2000, duration: 90, rating: 4.4, totalReviews: 34, bookingCount: 67, tags: [], isActive: true },
  { name: 'Preventive Maintenance', category: 'Maintenance', description: 'Comprehensive preventive maintenance package including cleaning, gas check, and performance test.', price: 3000, duration: 120, rating: 4.7, totalReviews: 78, bookingCount: 156, tags: ['recommended'], isActive: true },
  { name: 'AC Health Inspection', category: 'Inspection', description: 'Thorough AC inspection report with recommendations for maintenance and repairs.', price: 800, duration: 45, rating: 4.6, totalReviews: 45, bookingCount: 89, tags: [], isActive: true },
];

const inventoryItems = [
  { name: 'AC Air Filter (Standard)', category: 'Filter', description: 'Standard AC filter for split units', quantity: 50, unit: 'piece', minStockLevel: 10, costPrice: 200, sellingPrice: 350, supplier: 'AC Parts Wholesale' },
  { name: 'AC Air Filter (HEPA)', category: 'Filter', description: 'High efficiency HEPA filter', quantity: 20, unit: 'piece', minStockLevel: 5, costPrice: 500, sellingPrice: 800, supplier: 'AC Parts Wholesale' },
  { name: 'R-22 Refrigerant Gas', category: 'Gas', description: 'R-22 refrigerant for older AC units', quantity: 15, unit: 'kg', minStockLevel: 5, costPrice: 800, sellingPrice: 1200, supplier: 'Gas Suppliers Pk' },
  { name: 'R-410A Refrigerant Gas', category: 'Gas', description: 'Modern R-410A refrigerant', quantity: 12, unit: 'kg', minStockLevel: 4, costPrice: 1200, sellingPrice: 1800, supplier: 'Gas Suppliers Pk' },
  { name: 'Capacitor 25uF', category: 'Capacitor', description: 'Start/run capacitor for AC compressor', quantity: 30, unit: 'piece', minStockLevel: 8, costPrice: 300, sellingPrice: 500, supplier: 'Electric Parts Store' },
  { name: 'Copper Pipe (per meter)', category: 'Pipe', description: 'Copper refrigerant pipe for installation', quantity: 100, unit: 'meter', minStockLevel: 20, costPrice: 150, sellingPrice: 250, supplier: 'Metal Supplies' },
  { name: 'Drain Pipe (per meter)', category: 'Pipe', description: 'PVC drain pipe for AC', quantity: 80, unit: 'meter', minStockLevel: 15, costPrice: 50, sellingPrice: 100, supplier: 'Plumbing Supplies' },
  { name: 'Fan Motor (Universal)', category: 'Motor', description: 'Universal fan motor for indoor unit', quantity: 5, unit: 'piece', minStockLevel: 3, costPrice: 2000, sellingPrice: 3000, supplier: 'Motor Dealers' },
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await Promise.all([User.deleteMany(), Service.deleteMany(), Technician.deleteMany(), Booking.deleteMany(), Inventory.deleteMany()]);
    console.log('Cleared existing data');

    // Create admin
    const admin = await User.create({ name: 'Admin User', email: 'admin@fullcareac.com', password: 'admin123', phone: '0300-1234567', role: 'admin' });
    console.log('Admin created: admin@fullcareac.com / admin123');

    // Create test user
    const user = await User.create({ name: 'Ahmed Khan', email: 'user@test.com', password: 'user1234', phone: '0312-9876543', address: 'Block 5, Gulshan-e-Iqbal, Karachi', role: 'user' });
    console.log('User created: user@test.com / user1234');

    // Create technicians
    const tech1User = await User.create({ name: 'Bilal Raza', email: 'bilal@tech.com', password: 'tech1234', phone: '0333-1112222', role: 'technician' });
    const tech2User = await User.create({ name: 'Kamran Ali', email: 'kamran@tech.com', password: 'tech1234', phone: '0344-3334444', role: 'technician' });

    const tech1 = await Technician.create({ user: tech1User._id, specializations: ['Cleaning', 'Repair', 'Gas Charging'], experience: 5, salary: 45000, rating: 4.8, totalReviews: 89, completedJobs: 234 });
    const tech2 = await Technician.create({ user: tech2User._id, specializations: ['Installation', 'Maintenance', 'Repair'], experience: 3, salary: 38000, rating: 4.6, totalReviews: 56, completedJobs: 145 });
    console.log('Technicians created');

    // Create services
    const createdServices = await Service.insertMany(services);
    console.log('Services seeded');

    // Create inventory
    const inventoryWithSkus = inventoryItems.map((item, index) => ({
      ...item,
      sku: `INV-${String(1001 + index).padStart(4, '0')}`
    }));
    await Inventory.insertMany(inventoryWithSkus);
    console.log('Inventory seeded');

    // Create sample bookings
    await Booking.create({
      user: user._id,
      service: createdServices[0]._id,
      technician: tech1._id,
      scheduledDate: new Date(Date.now() + 86400000),
      scheduledTime: '10:00 AM',
      address: 'Block 5, Gulshan-e-Iqbal, Karachi',
      city: 'Karachi',
      acType: 'Split',
      acBrand: 'Dawlance',
      acTons: 1.5,
      status: 'confirmed',
      paymentMethod: 'cash',
      totalAmount: 2500,
      statusHistory: [{ status: 'pending' }, { status: 'confirmed' }],
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin: admin@fullcareac.com / admin123');
    console.log('  User: user@test.com / user1234');
    console.log('  Technician: bilal@tech.com / tech1234');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seedDB();
