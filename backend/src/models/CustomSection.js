const mongoose = require('mongoose');

const CustomSectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // The internal name/id of the section
  label: { type: String, required: true }, // The display name
  icon: { type: String, default: 'code' },
  fields: [{
    name: { type: String, required: true }, // e.g., 'title'
    label: { type: String, required: true }, // e.g., 'Project Title'
    type: { type: String, enum: ['text', 'multiline', 'link', 'number'], default: 'text' },
  }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

const CustomSection = mongoose.model('CustomSection', CustomSectionSchema);

module.exports = { CustomSection };
