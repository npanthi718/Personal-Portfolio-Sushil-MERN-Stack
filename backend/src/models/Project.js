const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  technologies: [{ type: String }],
  liveLink: { type: String },
  githubLink: { type: String },
  keyContributions: [{ type: String }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Project = mongoose.model('Project', ProjectSchema);

module.exports = { Project };
