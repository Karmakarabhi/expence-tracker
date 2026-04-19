const Holding = require('../models/Holding');
const PriceCache = require('../models/PriceCache');
const { fetchNav } = require('../utils/mfApiFetcher');

exports.refreshCache = async (amfiCodes) => {
  console.log(`Refreshing cache for ${amfiCodes.length} AMFI codes...`);
  
  for (const code of amfiCodes) {
    if (!code) continue;
    
    const nav = await fetchNav(code);
    if (nav) {
      await PriceCache.findOneAndUpdate(
        { amfiCode: code },
        { nav, date: new Date(), updatedAt: Date.now() },
        { upsert: true, new: true }
      );
      
      // Update all holdings globally that match this AMC code
      await Holding.updateMany({ amfiCode: code }, { currentNav: nav });
    }
  }
  
  console.log('Price refresh completed.');
};
