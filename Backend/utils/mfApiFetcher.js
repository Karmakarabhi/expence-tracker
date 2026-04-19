const axios = require('axios');

exports.fetchNav = async (amfiCode) => {
  try {
    const { data } = await axios.get(`https://api.mfapi.in/mf/${amfiCode}`);
    if (data && data.data && data.data.length > 0) {
      return parseFloat(data.data[0].nav);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching NAV for ${amfiCode}:`, error.message);
    return null;
  }
};

exports.fetchSchemeList = async (query) => {
  try {
    const { data } = await axios.get(`https://api.mfapi.in/mf/search?q=${query}`);
    return data; // Array of { schemeCode, schemeName }
  } catch (error) {
    console.error('Error fetching scheme list:', error.message);
    return [];
  }
};
