const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  institution: { type: String, required: true },
  date: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Course = mongoose.model('Course', CourseSchema);

module.exports = { Course };
