const mongoose = require('mongoose');

const CustomItemSchema = new mongoose.Schema({
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomSection', required: true },
  data: { type: Map, of: String }, // Flexible data storage
  order: { type: Number, default: 0 },
}, { timestamps: true });

const CustomItem = mongoose.model('CustomItem', CustomItemSchema);

module.exports = { CustomItem };
