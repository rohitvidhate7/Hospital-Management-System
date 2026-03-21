const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();


const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Department = require('./models/Department');
const Service = require('./models/Service');
const Appointment = require('./models/Appointment');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');

// Connect to DB
const connectDB = require('./config/db');

const main = async () => {
  await connectDB();

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

main();


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
  const adminExists = await User.findOne({ email: 'admin@hospital.com' });
  if (adminExists) {
    console.log('👤 Admin user already exists, skipping user seed');
    return;
  }

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


// Fixed Seed Demo Data with valid ObjectIds & task structure
const seedDemoData = async () => {
  console.log('🌱 Seeding Departments...');
  const departments = await Department.insertMany([
    { name: 'Cardiology', description: 'Heart care specialists' },
    { name: 'Neurology', description: 'Brain & nervous system' },
    { name: 'Orthopedics', description: 'Musculoskeletal system' },
    { name: 'General Medicine', description: 'Primary care' }
  ]);
  console.log('✅ Departments:', departments.map(d => ({id: d._id, name: d.name})));

  console.log('🌱 Seeding Services...');
  await Service.insertMany([
    { name: 'Complete Blood Test', price: 800, description: 'CBC, ESR, etc.' },
    { name: 'Chest X-Ray', price: 1200 },
    { name: 'ECG', price: 600 },
    { name: 'MRI Brain', price: 8000 }
  ]);
  console.log('✅ Services seeded');

  console.log('🌱 Seeding Doctors (task structure)...');
  const cardiologyId = departments[0]._id;
  const neurologyId = departments[1]._id;
  const orthopedicsId = departments[2]._id;
  
  const doctors = await Doctor.insertMany([
    {
      name: 'Dr. Sanjay Mehta',
      email: 'sanjay@hospital.com',
      phone: '9876500009',
      specialization: 'Cardiologist',
      department: cardiologyId,
      qualification: 'MD, DM Cardiology',
      experience: 20,
      consultationFee: 1500,
      availability: {
        status: 'Available',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '09:00',
        endTime: '17:00'
      },
      status: 'Available' // Both for compatibility
    },
    {
      name: 'Dr. Priya Sharma',
      email: 'priya@hospital.com',
      phone: '9876500010',
      specialization: 'Neurologist',
      department: neurologyId,
      qualification: 'MBBS, MD Neurology',
      experience: 15,
      consultationFee: 1200,
      availability: { status: 'Available', days: ['Monday', 'Wednesday', 'Friday'] },
      status: 'Available'
    },
    {
      name: 'Dr. Raj Patel',
      email: 'raj@hospital.com',
      phone: '9876500011',
      specialization: 'Orthopedic Surgeon',
      department: orthopedicsId,
      qualification: 'MBBS, MS Orthopedics',
      experience: 12,
      consultationFee: 1800,
      availability: { status: 'Busy' },
      status: 'Busy'
    }
  ]);
  console.log('✅ Doctors:', doctors.map(d => ({name: d.name, status: d.status, dept: d.department.toString()})));

  console.log('🌱 Seeding Patients...');
  await Patient.insertMany([
    { name: 'Jane Smith', age: 45, gender: 'Female', phone: '9876543210', bloodGroup: 'O+', status: 'Active' },
    { name: 'Mike Wilson', age: 32, gender: 'Male', phone: '9876543211', bloodGroup: 'B+', status: 'Critical' },
    { name: 'Sarah Johnson', age: 28, gender: 'Female', phone: '9876543212', bloodGroup: 'A-', status: 'Active' }
  ]);
  console.log('✅ Patients seeded');

  console.log('🌱 Demo data complete! 3 Doctors (2 Available), 4 Depts, 4 Services, 3 Patients');
};



