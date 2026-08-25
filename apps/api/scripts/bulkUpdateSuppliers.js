const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Expense = require('../models/Expense');

// Load environment variables
dotenv.config({ path: './.env' });

async function run() {
  await connectDB();

  // Define your update criteria here
  const targetItemKeyword = 'cement'; // Change to match items (case-insensitive)
  const supplierName = 'Ultratech Cement'; // The supplier to assign

  console.log(`Searching for expenses matching: "${targetItemKeyword}"...`);

  try {
    const result = await Expense.updateMany(
      { 
        itemName: { $regex: targetItemKeyword, $options: 'i' },
        $or: [{ supplierName: { $exists: false } }, { supplierName: '' }, { supplierName: null }]
      },
      { $set: { supplierName: supplierName } }
    );

    console.log(`Success! Updated ${result.modifiedCount} expenses with supplier: "${supplierName}"`);
  } catch (error) {
    console.error('Error updating records:', error);
  } finally {
    mongoose.connection.close();
  }
}

run();
