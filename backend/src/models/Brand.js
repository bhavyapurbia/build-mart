import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  logo: { type: String, default: '' },
  description: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  minimize: false
});

brandSchema.index({ isActive: 1, isFeatured: 1 });

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

export default Brand;
export { Brand };
