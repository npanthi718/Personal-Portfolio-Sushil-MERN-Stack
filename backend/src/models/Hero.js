const mongoose = require('mongoose');

const HeroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitles: [{ type: String }],
  relocation: { type: String },
  overview: { type: String },
  resumeLink: { type: String },
  photoLink: { type: String },
  resumePublicId: { type: String },
  photoPublicId: { type: String },
}, { timestamps: true });

const Hero = mongoose.model('Hero', HeroSchema);

module.exports = { Hero };
