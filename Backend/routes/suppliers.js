const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSuppliers,
  getSupplierSummary,
  getSupplierLedger,
  getSupplierSettlements,
  recordSettlement,
  deleteSettlement,
} = require('../controllers/supplierController');

// All routes require authentication
router.use(protect);

// GET: Summary of all suppliers with spending
router.get('/summary', getSupplierSummary);

// GET: All suppliers for user
router.get('/', getSuppliers);

// GET: Full ledger for a supplier (expenses + settlements)
router.get('/ledger/:supplierName', getSupplierLedger);

// GET: Settlement history for a supplier
router.get('/:supplierName/settlements', getSupplierSettlements);

// POST: Record a settlement payment
router.post('/settle', recordSettlement);

// DELETE: Remove a settlement record
router.delete('/settlements/:settlementId', deleteSettlement);

module.exports = router;
