const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  paragraphs: [{ type: String }],
  contactList: [{
    label: { type: String },
    value: { type: String },
    url: { type: String },
    icon: { type: String }
  }],
  googleFormLink: { type: String },
}, { timestamps: true });

const About = mongoose.model('About', AboutSchema);

module.exports = { About };
