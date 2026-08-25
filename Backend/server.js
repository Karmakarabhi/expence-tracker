const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to database
connectDB().then(async () => {
  try {
    const Expense = require('./models/Expense');
    const expenses = await Expense.find({
      paymentStatus: 'paid',
      $or: [{ paidAmount: { $exists: false } }, { paidAmount: 0 }]
    });
    
    let count = 0;
    for (let exp of expenses) {
      exp.paidAmount = exp.totalAmount;
      await exp.save();
      count++;
    }
    
    if (count > 0) {
      console.log(`Synced paidAmount = totalAmount for ${count} existing paid expenses.`);
    }
  } catch (err) {
    console.error('Error migrating existing paidAmount field:', err);
  }
});

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Setup
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'], // Set this in Render dashboard
  credentials: true
}));

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/attachments', require('./routes/attachments'));
app.use('/api/portfolios', require('./routes/portfolios'));
app.use('/api/holdings', require('./routes/holdings'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/mf', require('./routes/mfSearch'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
