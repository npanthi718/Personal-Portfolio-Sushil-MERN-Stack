const mongoose = require('mongoose');

const AdditionalExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  date: { type: String },
  location: { type: String },
  description: [{ type: String }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

const AdditionalExperience = mongoose.model('AdditionalExperience', AdditionalExperienceSchema);

module.exports = { AdditionalExperience };
