const cron = require('node-cron');
const Holding = require('../models/Holding');
const { refreshCache } = require('../controllers/priceCacheController');

// Run Weekdays at 11:30 PM (IST time normally, but let's assume server timezone matches)
cron.schedule('30 23 * * 1-5', async () => {
  console.log('[CRON] Running daily NAV price updater...');
  try {
    const distinctCodes = await Holding.distinct('amfiCode', { amfiCode: { $exists: true, $ne: null } });
    if (distinctCodes.length > 0) {
      await refreshCache(distinctCodes);
    } else {
      console.log('[CRON] No active MF holdings to update.');
    }
  } catch (error) {
    console.error('[CRON] Error during price update:', error);
  }
});
