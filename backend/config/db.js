const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI environment variable is not set!');
      console.error('1. Copy backend/.env.example → backend/.env');
      console.error('2. Update MONGO_URI with your MongoDB Atlas connection string');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log('   Atlas connection successful!');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    if (error.message.includes('Could not connect to any servers')) {
      console.error('\n🚨 ATLAS IP WHITELIST ISSUE (MOST COMMON):');
      console.error('1. Go to https://cloud.mongodb.com → Your Cluster → Network Access');
      console.error('2. Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)');
      console.error('3. Or add your current IP: https://www.whatismyipaddress.com/');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n🚨 WRONG USERNAME/PASSWORD:');
      console.error('1. Atlas → Database Access → Edit your database user');
      console.error('2. Reset password if needed');
    }
    
    console.error('\n💡 Get Connection String:');
    console.error('Atlas → Your Cluster → Connect → Drivers → Copy & paste to .env');
    console.error('\n📄 Template: backend/.env.example');
    
    process.exit(1);
  }
};

module.exports = connectDB;
