const express = require("express")
const app = express();
const cors = require('cors')
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const cron = require('node-cron');
const mongoose = require('mongoose');

//sub admin
const authRoutes = require("./routes/auth.routes")
const releaseRoutes = require("./routes/release.routes");
const artistRoutes = require("./routes/artist.routes");
const supportRoutes = require("./routes/support.routes");
const bankRoutes = require("./routes/bank.routes");
const walletRoutes = require("./routes/wallet.route");
const permissionsRoutes = require("./routes/permission.routes");
const importExcel = require("./routes/importExcel.routes");
const companyRoutes = require("./routes/company.routes");
const dashboardRoutes = require("./routes/dashboard.route");
const settingRoutes = require("./routes/setting.routes");
const uploadRoutes = require("./routes/upload.routes")
const reportRoutes = require("./routes/report.routes")
const bodyParser = require('body-parser');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import authModel for cron jobs (will be initialized after DB connection)
const authModel = require("./models/authmodels");

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
// Increase payload size limits
app.use(bodyParser.json({ limit: '200mb' })); // Adjust based on your dataset size
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

dotenv.config();
app.use(cors({
  origin: '*'
}));

// Database Connection with Logging
const connectDatabase = async () => {
  try {
    console.log('\n========================================');
    console.log('🔄 Database Connection Starting...');
    console.log('========================================\n');
    
    // Get database URL from environment
    const dbUrl = process.env.LOCALDB || process.env.MONGODB_URI;
    
    if (!dbUrl) {
      console.error('❌ ERROR: Database URL not found in environment variables!');
      console.error('   Please set LOCALDB or MONGODB_URI in your .env file');
      process.exit(1);
    }
    
    // Extract database name for logging (hide password)
    const dbInfo = dbUrl.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://***:***@');
    console.log(`📡 Connecting to: ${dbInfo}`);
    console.log(`⏳ Attempting connection...\n`);
    
    // Set mongoose options
    mongoose.set("strictQuery", false);
    
    // Connect to MongoDB
    const connection = await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true
    });
    
    // Get connection info
    const dbName = connection.connection.name;
    const dbHost = connection.connection.host;
    const dbPort = connection.connection.port;
    const dbState = connection.connection.readyState;
    
    console.log('\n========================================');
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`📊 Database Name: ${dbName}`);
    console.log(`🌐 Host: ${dbHost}:${dbPort}`);
    console.log(`🔌 Connection State: ${getConnectionState(dbState)}`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ DATABASE CONNECTION FAILED!');
    console.error('========================================');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code || 'N/A'}`);
    console.error('========================================\n');
    
    // Exit process if database connection fails
    console.log('⚠️  Server will continue but database operations will fail.');
    console.log('   Please check your database connection and restart the server.\n');
  }
};

// Helper function to get connection state
const getConnectionState = (state) => {
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  return states[state] || 'Unknown';
};

// MongoDB Connection Event Listeners
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Initialize database connection
connectDatabase().then(() => {
  // Setup cron jobs after database connection is established
  console.log('⏰ Setting up cron jobs...\n');
  
  // Schedule a task to run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running hourly cron job...');
    try {
      await authModel.cronForOneHour();
      console.log('✅ Hourly cron job completed successfully');
    } catch (error) {
      console.error('❌ Error in hourly cron job:', error.message);
    }
  });
  
  // Schedule a task to run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily cron job at midnight...');
    try {
      await authModel.cronForOneDay();
      console.log('✅ Daily cron job completed successfully');
    } catch (error) {
      console.error('❌ Error in daily cron job:', error.message);
    }
  });
  
  console.log('✅ Cron jobs scheduled successfully\n');
}).catch((error) => {
  console.error('❌ Failed to initialize database:', error.message);
});
 
const adminRoutes = require("./routes/admin.routes");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/company", companyRoutes);
app.use("/release", releaseRoutes);
app.use("/payment", require("./routes/payment.routes"));
app.use("/artist", artistRoutes);
app.use("/support", supportRoutes);
app.use("/bank", bankRoutes);
app.use("/wallet", walletRoutes);
app.use("/permission", permissionsRoutes);
app.use("/excel", importExcel);
app.use("/dashboard", dashboardRoutes);
app.use("/setting", settingRoutes);
app.use("/upload", uploadRoutes)
app.use("/report", reportRoutes)



const server = new http.createServer({}, app);
server.listen(8002, () => { 
  console.log('\n========================================');
  console.log('🚀 SERVER STARTED SUCCESSFULLY!');
  console.log('========================================');
  console.log(`🌐 Server running on: http://localhost:8002`);
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log('========================================\n');
});