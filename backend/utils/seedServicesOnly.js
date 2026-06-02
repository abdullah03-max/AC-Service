const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Service = require('../models/Service');
const { services } = require('./seeder');

async function seedServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    for (const svc of services) {
      const exists = await Service.findOne({ name: svc.name, category: svc.category });
      if (exists) {
        console.log(`Skipped (exists): ${svc.name} [${svc.category}]`);
        continue;
      }
      await Service.create(svc);
      console.log(`Inserted: ${svc.name} [${svc.category}]`);
    }

    console.log('\n✅ Services seeded (non-destructive)');
    process.exit(0);
  } catch (err) {
    console.error('Seeding services failed:', err.message);
    process.exit(1);
  }
}

seedServices();
