const { createUnifiedModel } = require('./dbAdapter');

const Brand = createUnifiedModel('Brand', {
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true },
  logo: { type: String },
  description: { type: String },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
});

module.exports = Brand;

