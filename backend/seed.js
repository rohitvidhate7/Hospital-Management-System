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


// Expanded Seed Demo Data with task requirements:
// 10 Doctors, 20 Patients, 30 Appointments, 20 Payments
const seedDemoData = async () => {
  console.log('🌱 Seeding Departments...');
  const departments = await Department.insertMany([
    { name: 'Cardiology', description: 'Heart care specialists' },
    { name: 'Neurology', description: 'Brain & nervous system' },
    { name: 'Orthopedics', description: 'Bone & joint specialists' },
    { name: 'General Medicine', description: 'Primary care & internal medicine' },
    { name: 'Pediatrics', description: 'Child healthcare' },
    { name: 'Dermatology', description: 'Skin care specialists' },
    { name: 'Ophthalmology', description: 'Eye care specialists' },
    { name: 'Gynecology', description: "Women's health" }
  ]);
  console.log('✅ Departments:', departments.length);

  console.log('🌱 Seeding Services...');
  await Service.insertMany([
    { name: 'Complete Blood Test', price: 800, description: 'CBC, ESR, etc.' },
    { name: 'Chest X-Ray', price: 1200 },
    { name: 'ECG', price: 600 },
    { name: 'MRI Brain', price: 8000 },
    { name: 'CT Scan', price: 5000 },
    { name: 'Ultrasound', price: 1500 },
    { name: 'Eye Checkup', price: 500 },
    { name: 'Dental Checkup', price: 400 }
  ]);
  console.log('✅ Services:', 8);

  console.log('🌱 Seeding 10 Doctors...');
  const doctors = await Doctor.insertMany([
    {
      name: 'Dr. Sanjay Mehta',
      email: 'sanjay@hospital.com',
      phone: '9876500009',
      specialization: 'Cardiologist',
      department: departments[0]._id,
      qualification: 'MD, DM Cardiology',
      experience: 20,
      consultationFee: 1500,
      availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], startTime: '09:00', endTime: '17:00' },
      status: 'Available'
    },
    {
      name: 'Dr. Priya Sharma',
      email: 'priya@hospital.com',
      phone: '9876500010',
      specialization: 'Neurologist',
      department: departments[1]._id,
      qualification: 'MBBS, MD Neurology',
      experience: 15,
      consultationFee: 1200,
      availability: { days: ['Monday', 'Wednesday', 'Friday'], startTime: '10:00', endTime: '16:00' },
      status: 'Available'
    },
    {
      name: 'Dr. Raj Patel',
      email: 'raj@hospital.com',
      phone: '9876500011',
      specialization: 'Orthopedic Surgeon',
      department: departments[2]._id,
      qualification: 'MBBS, MS Orthopedics',
      experience: 12,
      consultationFee: 1800,
      availability: { days: ['Tuesday', 'Thursday', 'Saturday'], startTime: '09:00', endTime: '14:00' },
      status: 'Available'
    },
    {
      name: 'Dr. Anjali Singh',
      email: 'anjali@hospital.com',
      phone: '9876500012',
      specialization: 'General Physician',
      department: departments[3]._id,
      qualification: 'MBBS, MD General Medicine',
      experience: 18,
      consultationFee: 800,
      availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], startTime: '08:00', endTime: '16:00' },
      status: 'Available'
    },
    {
      name: 'Dr. Vikram Joshi',
      email: 'vikram@hospital.com',
      phone: '9876500013',
      specialization: 'Pediatrician',
      department: departments[4]._id,
      qualification: 'MBBS, MD Pediatrics',
      experience: 10,
      consultationFee: 900,
      availability: { days: ['Monday', 'Wednesday', 'Friday'], startTime: '10:00', endTime: '17:00' },
      status: 'Available'
    },
    {
      name: 'Dr. Meera Nair',
      email: 'meera@hospital.com',
      phone: '9876500014',
      specialization: 'Dermatologist',
      department: departments[5]._id,
      qualification: 'MBBS, MD Dermatology',
      experience: 8,
      consultationFee: 1000,
      availability: { days: ['Tuesday', 'Thursday', 'Saturday'], startTime: '11:00', endTime: '18:00' },
      status: 'Available'
    },
    {
      name: 'Dr. Kiran Reddy',
      email: 'kiran@hospital.com',
      phone: '9876500015',
      specialization: 'Ophthalmologist',
      department: departments[6]._id,
      qualification: 'MBBS, MS Ophthalmology',
      experience: 14,
      consultationFee: 1100,
      availability: { days: ['Monday', 'Tuesday', 'Thursday'], startTime: '09:00', endTime: '15:00' },
      status: 'Available'
    },
    {
      name: 'Dr. Sunita Gupta',
      email: 'sunita@hospital.com',
      phone: '9876500016',
      specialization: 'Gynecologist',
      department: departments[7]._id,
      qualification: 'MBBS, MD Obstetrics',
      experience: 16,
      consultationFee: 1200,
      availability: { days: ['Monday', 'Wednesday', 'Friday'], startTime: '10:00', endTime: '17:00' },
      status: 'Available'
    },
    {
      name: 'Dr. Amit Kumar',
      email: 'amit@hospital.com',
      phone: '9876500017',
      specialization: 'Cardiologist',
      department: departments[0]._id,
      qualification: 'MD, DM Cardiology',
      experience: 9,
      consultationFee: 1300,
      availability: { days: ['Wednesday', 'Thursday', 'Friday'], startTime: '10:00', endTime: '16:00' },
      status: 'Available'
    },
    {
      name: 'Dr. Rajesh Verma',
      email: 'rajesh@hospital.com',
      phone: '9876500018',
      specialization: 'Orthopedic Surgeon',
      department: departments[2]._id,
      qualification: 'MBBS, MS Orthopedics',
      experience: 7,
      consultationFee: 1500,
      availability: { days: ['Monday', 'Tuesday'], startTime: '09:00', endTime: '14:00' },
      status: 'On Leave'
    }
  ]);
  console.log('✅ Doctors:', doctors.length);

  console.log('🌱 Seeding 20 Patients...');
  const patients = await Patient.insertMany([
    { name: 'Jane Smith', email: 'jane.smith@email.com', phone: '9876543210', age: 45, gender: 'Female', bloodGroup: 'O+', address: 'Mumbai', status: 'Active' },
    { name: 'Mike Wilson', email: 'mike.wilson@email.com', phone: '9876543211', age: 32, gender: 'Male', bloodGroup: 'B+', address: 'Delhi', status: 'Critical' },
    { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '9876543212', age: 28, gender: 'Female', bloodGroup: 'A-', address: 'Bangalore', status: 'Active' },
    { name: 'David Brown', email: 'david.b@email.com', phone: '9876543213', age: 55, gender: 'Male', bloodGroup: 'AB+', address: 'Chennai', status: 'Active' },
    { name: 'Emily Davis', email: 'emily.d@email.com', phone: '9876543214', age: 38, gender: 'Female', bloodGroup: 'O-', address: 'Hyderabad', status: 'Active' },
    { name: 'James Miller', email: 'james.m@email.com', phone: '9876543215', age: 42, gender: 'Male', bloodGroup: 'A+', address: 'Pune', status: 'Active' },
    { name: 'Linda Anderson', email: 'linda.a@email.com', phone: '9876543216', age: 35, gender: 'Female', bloodGroup: 'B-', address: 'Kolkata', status: 'Active' },
    { name: 'Robert Taylor', email: 'robert.t@email.com', phone: '9876543217', age: 50, gender: 'Male', bloodGroup: 'O+', address: 'Ahmedabad', status: 'Active' },
    { name: 'Maria Garcia', email: 'maria.g@email.com', phone: '9876543218', age: 29, gender: 'Female', bloodGroup: 'AB-', address: 'Jaipur', status: 'Active' },
    { name: 'William Martinez', email: 'william.m@email.com', phone: '9876543219', age: 48, gender: 'Male', bloodGroup: 'B+', address: 'Surat', status: 'Active' },
    { name: 'Jennifer Lee', email: 'jennifer.l@email.com', phone: '9876543220', age: 41, gender: 'Female', bloodGroup: 'A+', address: 'Lucknow', status: 'Active' },
    { name: 'Richard White', email: 'richard.w@email.com', phone: '9876543221', age: 36, gender: 'Male', bloodGroup: 'O+', address: 'Kanpur', status: 'Active' },
    { name: 'Patricia Harris', email: 'patricia.h@email.com', phone: '9876543222', age: 44, gender: 'Female', bloodGroup: 'B+', address: 'Nagpur', status: 'Active' },
    { name: 'Thomas Clark', email: 'thomas.c@email.com', phone: '9876543223', age: 52, gender: 'Male', bloodGroup: 'AB+', address: 'Indore', status: 'Active' },
    { name: 'Barbara Lewis', email: 'barbara.l@email.com', phone: '9876543224', age: 33, gender: 'Female', bloodGroup: 'A-', address: 'Bhopal', status: 'Active' },
    { name: 'Charles Robinson', email: 'charles.r@email.com', phone: '9876543225', age: 47, gender: 'Male', bloodGroup: 'O-', address: 'Patna', status: 'Active' },
    { name: 'Nancy Walker', email: 'nancy.w@email.com', phone: '9876543226', age: 39, gender: 'Female', bloodGroup: 'B+', address: ' Ranchi', status: 'Active' },
    { name: 'Daniel Hall', email: 'daniel.h@email.com', phone: '9876543227', age: 31, gender: 'Male', bloodGroup: 'A+', address: 'Jammu', status: 'Active' },
    { name: 'Susan Allen', email: 'susan.a@email.com', phone: '9876543228', age: 46, gender: 'Female', bloodGroup: 'AB-', address: 'Chandigarh', status: 'Active' },
    { name: 'Joseph Young', email: 'joseph.y@email.com', phone: '9876543229', age: 37, gender: 'Male', bloodGroup: 'O+', address: 'Dehradun', status: 'Active' }
  ]);
  console.log('✅ Patients:', patients.length);

  console.log('🌱 Seeding 30 Appointments...');
  const appointmentStatuses = ['Pending', 'Confirmed', 'Completed'];
  const appointmentTypes = ['Consultation', 'Follow-up', 'Emergency', 'Lab Test'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
  const appointments = [];

  // Generate 30 appointments
  for (let i = 0; i < 30; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const daysOffset = Math.floor(Math.random() * 30) - 10; // -10 to +20 days
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    
    appointments.push({
      patient: patient._id,
      doctor: doctor._id,
      date: date,
      time: timeSlots[Math.floor(Math.random() * timeSlots.length)],
      type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
      status: appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)],
      notes: '',
      fee: doctor.consultationFee
    });
  }

  const savedAppointments = await Appointment.insertMany(appointments);
  console.log('✅ Appointments:', savedAppointments.length);

  console.log('🌱 Seeding 20 Payments...');
  const paymentStatuses = ['Paid', 'Pending', 'Failed'];
  const paymentMethods = ['Cash', 'UPI', 'Card'];
  const payments = [];

  // Generate 20 payments linked to patients and appointments
  for (let i = 0; i < 20; i++) {
    const patient = patients[i % patients.length];
    const appointment = savedAppointments[i % savedAppointments.length];
    const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    
    // Amount based on doctor's consultation fee (somevariation)
    const baseAmount = doctors[i % doctors.length].consultationFee;
    const amount = baseAmount + Math.floor(Math.random() * 500);

    payments.push({
      patient: patient._id,
      appointment: appointment._id,
      amount: amount,
      status: status,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      transactionId: status === 'Paid' ? `TXN${Date.now()}${i}` : '',
      notes: ''
    });
  }

  const savedPayments = await Payment.insertMany(payments);
  console.log('✅ Payments:', savedPayments.length);

  console.log('\n🎉 DEMO DATA COMPLETE!');
  console.log('📊 Summary:');
  console.log('  - Departments:', departments.length);
  console.log('  - Services:', 8);
  console.log('  - Doctors:', doctors.length);
  console.log('  - Patients:', patients.length);
  console.log('  - Appointments:', savedAppointments.length);
  console.log('  - Payments:', savedPayments.length);
  
  console.log('\n📝 Demo Login:');
  console.log('  Email: admin@hospital.com');
  console.log('  Password: admin123');
};
