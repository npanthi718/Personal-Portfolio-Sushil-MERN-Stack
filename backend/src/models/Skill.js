const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  proficiency: { type: Number, default: 0 },
  icon: { type: String }, // New field for icon
  order: { type: Number, default: 0 },
  categoryOrder: { type: Number, default: 0 },
}, { timestamps: true });

const Skill = mongoose.model('Skill', SkillSchema);

module.exports = { Skill };
