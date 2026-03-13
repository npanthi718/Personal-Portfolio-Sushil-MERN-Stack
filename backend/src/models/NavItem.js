const mongoose = require('mongoose');

const NavItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  href: { type: String, required: true },
  icon: { type: String }, // New field for icon
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
}, { timestamps: true });

const NavItem = mongoose.model('NavItem', NavItemSchema);

module.exports = { NavItem };
