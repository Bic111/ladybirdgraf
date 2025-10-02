const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const shiftTypeRoutes = require('./routes/shiftTypes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifttypes', shiftTypeRoutes);

// Simple root endpoint to check if the server is running
app.get('/', (req, res) => {
  res.send('Scheduling App API is running...');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});