// Updated Seed Script for Modern Backend
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Department = require('./models/Department');
// ... import all models

dotenv.config();

const seedData = async () => {
  await mongoose.connection.collections.users.drop();
  // ... seed users, patients etc with test data
  console.log('✅ Database seeded!');
};

seedData().catch(console.error);
