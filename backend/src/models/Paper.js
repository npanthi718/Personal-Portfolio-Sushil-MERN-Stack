const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organizer: { type: String },
  institution: { type: String },
  date: { type: String },
  location: { type: String },
  description: [{ type: String }],
  link: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Paper = mongoose.model('Paper', PaperSchema);

module.exports = { Paper };
