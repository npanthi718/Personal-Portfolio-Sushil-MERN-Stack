const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  dates: { type: String },
  cgpa: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Education = mongoose.model('Education', EducationSchema);

module.exports = { Education };
