const express = require('express');
const {
  addHolding,
  getHoldings,
  updateHolding,
  deleteHolding,
} = require('../controllers/holdingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, addHolding);

router.route('/portfolio/:portfolioId')
  .get(protect, getHoldings);

router.route('/:id')
  .put(protect, updateHolding)
  .delete(protect, deleteHolding);

module.exports = router;