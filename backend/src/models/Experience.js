const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  date: { type: String },
  location: { type: String },
  description: [{ type: String }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Experience = mongoose.model('Experience', ExperienceSchema);

module.exports = { Experience };
