const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: './config/config.env' });

const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Department = require('./models/Department');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('DB connection error:', err));

// Clear existing data
const clearData = async () => {
  await Promise.all([
    User.deleteMany(),
    Patient.deleteMany(),
    Doctor.deleteMany(),
    Department.deleteMany(),
    Service.deleteMany(),
    Appointment.deleteMany(),
    Booking.deleteMany(),
    Payment.deleteMany(),
  ]);
  console.log('✅ Cleared existing data');
};

// Seed Demo Users
const seedUsers = async () => {
  const hashedAdmin = await bcrypt.hash('admin123', 12);
  const hashedRecep = await bcrypt.hash('reception123', 12);
  const hashedPatient = await bcrypt.hash('patient123', 12);

  await User.insertMany([
    { name: 'Hospital Admin', email: 'admin@hospital.com', password: hashedAdmin, role: 'admin' },
    { name: 'Reception Staff', email: 'reception@hospital.com', password: hashedRecep, role: 'receptionist' },
    { name: 'John Doe', email: 'patient@hospital.com', password: hashedPatient, role: 'patient' },
  ]);
  console.log('✅ Seeded 3 users');
};

// Seed Demo Data
const seedDemoData = async () => {
  await Department.insertMany([
    { name: 'Cardiology', description: 'Heart care' },
    { name: 'Neurology', description: 'Brain & nerves' },
    { name: 'Orthopedics', description: 'Bones & joints' },
  ]);

  await Service.insertMany([
    { name: 'Blood Test - Complete', price: 800 },
    { name: 'X-Ray Chest', price: 1200 },
    { name: 'ECG', price: 600 },
  ]);

  await Doctor.insertMany([
    { name: 'Dr. Smith', specialization: 'Cardiologist', department: '64f...', status: 'Available' },
    { name: 'Dr. Johnson', specialization: 'Neurologist', department: '64f...', status: 'Busy' },
  ]);

  await Patient.insertMany([
    { name: 'Jane Smith', age: 45, gender: 'female', phone: '9876543210', status: 'Active' },
    { name: 'Mike Wilson', age: 32, gender: 'male', phone: '9876543211', status: 'Critical' },
  ]);

  console.log('✅ Seeded demo data');
};

const importData = async () => {
  try {
    await clearData();
    await seedUsers();
    await seedDemoData();
    console.log('🎉 SEEDING COMPLETE! Login with admin@hospital.com/admin123');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    process.exit();
  }
};

importData();

