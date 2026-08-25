// Newton-Raphson method for calculating XIRR
// cashflows should be an array of objects: { amount: Number, date: Date }
// amount < 0 for investments (outflows), amount > 0 for returns (inflows)

const DAYS_IN_YEAR = 365;

exports.xirr = (cashflows) => {
  if (!cashflows || cashflows.length === 0) return 0;

  // Filter 0 cashflows, map date to epoch
  const cfs = cashflows
    .filter((c) => Math.abs(c.amount) > 0)
    .map((c) => ({
      amount: c.amount,
      date: new Date(c.date).getTime(),
    }));

  if (cfs.length < 2) return 0; // Need at least 2 flows

  // Sort by date mostly for the basis reference
  cfs.sort((a, b) => a.date - b.date);

  const t0 = cfs[0].date;
  let rate = 0.1; // initial guess 10%
  let iteration = 0;
  const maxIter = 100;
  const tol = 1e-5;

  while (iteration < maxIter) {
    let fValue = 0;
    let fDerivative = 0;

    for (let c of cfs) {
      const p = (c.date - t0) / (DAYS_IN_YEAR * 24 * 60 * 60 * 1000); // Years since first CF
      const factor = Math.pow(1 + rate, p);

      fValue += c.amount / factor;
      
      // Derivative of A*(1+r)^(-p) = -A*p*(1+r)^(-p-1)
      if (p !== 0) {
          fDerivative -= (c.amount * p) / Math.pow(1 + rate, p + 1);
      }
    }

    if (Math.abs(fValue) < tol) {
      return rate;
    }

    if (Math.abs(fDerivative) < 1e-15) {
      // Derivative is too small, likely divergent. Return what we have or 0
      return rate;
    }

    rate = rate - (fValue / fDerivative);
    iteration++;
  }

  // Did not converge
  return rate;
};
