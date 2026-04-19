const Holding = require('../models/Holding');
const InvestmentTransaction = require('../models/Transaction');

exports.recalcHolding = async (holdingId) => {
  // Queries all BUY/SIP/SELL/SWITCH_IN/SWITCH_OUT transactions for holding
  // Computes running units (+=BUY, -=SELL) and weighted avgCost.
  
  const transactions = await InvestmentTransaction.find({ holdingId }).sort('date');
  
  let totalUnits = 0;
  let totalInvested = 0;

  for (const tx of transactions) {
    if (['BUY', 'SIP', 'SWITCH_IN', 'DIVIDEND'].includes(tx.type)) {
      // For dividend reinvestment, it acts like a buy
      totalUnits += tx.units;
      totalInvested += tx.amount;
    } else if (['SELL', 'SWITCH_OUT'].includes(tx.type)) {
      // When selling, units decrease. Amount withdrawn lowers the "invested" base proportionally.
      // Proportional reduction in invested capital
      if (totalUnits > 0) {
        const avgCostAtSale = totalInvested / totalUnits;
        totalUnits -= tx.units;
        totalInvested -= (tx.units * avgCostAtSale);
      }
    }
  }

  // Prevent tiny fractional remainders around 0
  if (totalUnits < 0.0001) {
    totalUnits = 0;
    totalInvested = 0;
  }

  const avgCost = totalUnits > 0 ? totalInvested / totalUnits : 0;

  await Holding.findByIdAndUpdate(holdingId, {
    units: totalUnits,
    avgCost: avgCost
  });
};
