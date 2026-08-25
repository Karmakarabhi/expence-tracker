const mongoose = require('mongoose');

const priceCacheSchema = new mongoose.Schema(
  {
    amfiCode: {
      type: String,
      required: [true, 'AMFI code is required'],
      unique: true,
      index: true,
    },
    nav: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PriceCache', priceCacheSchema);