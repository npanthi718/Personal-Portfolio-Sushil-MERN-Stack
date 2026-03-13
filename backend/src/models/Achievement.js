const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String },
  date: { type: String },
  location: { type: String },
  description: [{ type: String }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = { Achievement };
