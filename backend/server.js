const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/services', require('./routes/services'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/bookings', require('./routes/bookings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hospital Management API is running' });
});

// Temporary seed endpoint (remove after seeding)
app.get('/api/seed-database', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const Department = require('./models/Department');
    const Doctor = require('./models/Doctor');
    const Patient = require('./models/Patient');
    const Appointment = require('./models/Appointment');
    const Service = require('./models/Service');

    await User.deleteMany({});
    await Department.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Service.deleteMany({});

    const admin = await User.create({ name: 'Admin User', email: 'admin@hospital.com', password: 'admin123', role: 'admin', phone: '9876543210' });
    await User.create({ name: 'Reception Staff', email: 'reception@hospital.com', password: 'reception123', role: 'receptionist', phone: '9876543211' });
    await User.create({ name: 'Rahul Patient', email: 'patient@hospital.com', password: 'patient123', role: 'patient', phone: '9876543212' });

    const departments = await Department.insertMany([
      { name: 'Cardiology', description: 'Heart and cardiovascular system care', icon: '❤️', status: 'Active' },
      { name: 'Neurology', description: 'Brain and nervous system disorders', icon: '🧠', status: 'Active' },
      { name: 'Orthopedics', description: 'Bone, joint, and muscle treatment', icon: '🦴', status: 'Active' },
      { name: 'Pediatrics', description: 'Medical care for infants and children', icon: '👶', status: 'Active' },
      { name: 'Dermatology', description: 'Skin, hair, and nail conditions', icon: '🧴', status: 'Active' },
      { name: 'Ophthalmology', description: 'Eye care and vision disorders', icon: '👁️', status: 'Active' },
      { name: 'ENT', description: 'Ear, nose, and throat treatment', icon: '👂', status: 'Active' },
      { name: 'General Medicine', description: 'Primary healthcare and diagnostics', icon: '🩺', status: 'Active' },
      { name: 'Gynecology', description: "Women's reproductive health", icon: '🏥', status: 'Active' },
      { name: 'Oncology', description: 'Cancer diagnosis and treatment', icon: '🎗️', status: 'Active' },
    ]);

    const doctors = await Doctor.insertMany([
      { name: 'Dr. Rajesh Kumar', email: 'rajesh@hospital.com', phone: '9876500001', specialization: 'Cardiologist', department: departments[0]._id, qualification: 'MD, DM Cardiology', experience: 15, consultationFee: 1000, status: 'Available' },
      { name: 'Dr. Priya Sharma', email: 'priya@hospital.com', phone: '9876500002', specialization: 'Neurologist', department: departments[1]._id, qualification: 'MD, DM Neurology', experience: 12, consultationFee: 1200, status: 'Available' },
      { name: 'Dr. Amit Patel', email: 'amit@hospital.com', phone: '9876500003', specialization: 'Orthopedic Surgeon', department: departments[2]._id, qualification: 'MS Orthopedics', experience: 10, consultationFee: 800, status: 'Available' },
      { name: 'Dr. Sunita Verma', email: 'sunita@hospital.com', phone: '9876500004', specialization: 'Pediatrician', department: departments[3]._id, qualification: 'MD Pediatrics', experience: 8, consultationFee: 600, status: 'Available' },
      { name: 'Dr. Vikram Singh', email: 'vikram@hospital.com', phone: '9876500005', specialization: 'Dermatologist', department: departments[4]._id, qualification: 'MD Dermatology', experience: 7, consultationFee: 700, status: 'Available' },
      { name: 'Dr. Neha Gupta', email: 'neha@hospital.com', phone: '9876500006', specialization: 'Ophthalmologist', department: departments[5]._id, qualification: 'MS Ophthalmology', experience: 9, consultationFee: 900, status: 'On Leave' },
      { name: 'Dr. Arjun Reddy', email: 'arjun@hospital.com', phone: '9876500007', specialization: 'ENT Specialist', department: departments[6]._id, qualification: 'MS ENT', experience: 11, consultationFee: 750, status: 'Available' },
      { name: 'Dr. Kavita Joshi', email: 'kavita@hospital.com', phone: '9876500008', specialization: 'General Physician', department: departments[7]._id, qualification: 'MD Medicine', experience: 14, consultationFee: 500, status: 'Available' },
      { name: 'Dr. Sanjay Mehta', email: 'sanjay@hospital.com', phone: '9876500009', specialization: 'Cardiologist', department: departments[0]._id, qualification: 'MD, DM Cardiology', experience: 20, consultationFee: 1500, status: 'Available' },
      { name: 'Dr. Anita Desai', email: 'anita@hospital.com', phone: '9876500010', specialization: 'Gynecologist', department: departments[8]._id, qualification: 'MD, DGO', experience: 16, consultationFee: 1100, status: 'Available' },
      { name: 'Dr. Ravi Shankar', email: 'ravi@hospital.com', phone: '9876500011', specialization: 'Oncologist', department: departments[9]._id, qualification: 'MD, DM Oncology', experience: 13, consultationFee: 1300, status: 'Busy' },
      { name: 'Dr. Meera Nair', email: 'meera@hospital.com', phone: '9876500012', specialization: 'Pediatrician', department: departments[3]._id, qualification: 'MD Pediatrics, Fellowship Neonatology', experience: 6, consultationFee: 650, status: 'Available' },
    ]);

    const patients = await Patient.insertMany([
      { name: 'Rahul Sharma', email: 'rahul@email.com', phone: '9898001001', age: 35, gender: 'Male', bloodGroup: 'O+', address: '123 MG Road, Mumbai', status: 'Active' },
      { name: 'Priya Patel', email: 'priyap@email.com', phone: '9898001002', age: 28, gender: 'Female', bloodGroup: 'A+', address: '45 Park Street, Delhi', status: 'Active' },
      { name: 'Amit Kumar', email: 'amitk@email.com', phone: '9898001003', age: 52, gender: 'Male', bloodGroup: 'B+', address: '67 Church Road, Bangalore', status: 'Active' },
      { name: 'Sunita Devi', email: 'sunita@email.com', phone: '9898001004', age: 45, gender: 'Female', bloodGroup: 'AB+', address: '89 Lake View, Chennai', status: 'Active' },
      { name: 'Vikram Rathore', email: 'vikramr@email.com', phone: '9898001005', age: 60, gender: 'Male', bloodGroup: 'O-', address: '12 Civil Lines, Jaipur', status: 'Critical' },
    ]);

    const services = await Service.insertMany([
      { name: 'Complete Blood Test (CBC)', description: 'Comprehensive blood count analysis', department: departments[7]._id, doctor: doctors[7]._id, price: 599, duration: 30, category: 'Lab Test', status: 'Active', icon: '🩸', image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop' },
      { name: 'Blood Pressure Monitoring', description: 'Accurate digital BP measurement', department: departments[0]._id, doctor: doctors[0]._id, price: 199, duration: 15, category: 'Procedure', status: 'Active', icon: '💓', image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=600&h=400&fit=crop' },
      { name: 'Digital X-Ray', description: 'High-resolution digital X-ray imaging', department: departments[2]._id, doctor: doctors[2]._id, price: 899, duration: 20, category: 'Imaging', status: 'Active', icon: '🦴', image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&h=400&fit=crop' },
      { name: 'ECG / Heart Scan', description: '12-lead electrocardiogram for heart analysis', department: departments[0]._id, doctor: doctors[8]._id, price: 749, duration: 30, category: 'Procedure', status: 'Active', icon: '❤️', image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&h=400&fit=crop' },
      { name: 'Full Body Health Checkup', description: 'Complete health screening package', department: departments[7]._id, doctor: doctors[7]._id, price: 2499, duration: 120, category: 'Lab Test', status: 'Active', icon: '🩺', image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=600&h=400&fit=crop' },
    ]);

    const today = new Date();
    const appointmentsData = [];
    const types = ['Consultation', 'Follow-up', 'Emergency', 'Lab Test'];
    const statuses = ['Scheduled', 'Completed', 'Cancelled', 'Completed', 'Completed', 'Scheduled'];
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30) + Math.floor(Math.random() * 7));
      const hour = 9 + Math.floor(Math.random() * 8);
      appointmentsData.push({ patient: patients[Math.floor(Math.random() * patients.length)]._id, doctor: doctors[Math.floor(Math.random() * doctors.length)]._id, date, time: `${hour.toString().padStart(2, '0')}:00`, type: types[Math.floor(Math.random() * types.length)], status: statuses[Math.floor(Math.random() * statuses.length)], notes: 'Seeded appointment', fee: [500, 600, 700, 800, 1000][Math.floor(Math.random() * 5)] });
    }
    await Appointment.insertMany(appointmentsData);

    res.json({ success: true, message: 'Database seeded! Login: admin@hospital.com / admin123' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/health`);
});
