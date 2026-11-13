import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  isPublished: { type: Boolean, default: true }
}, {
  timestamps: true,
  minimize: false
});

const Page = mongoose.models.Page || mongoose.model('Page', pageSchema);

export default Page;
export { Page };

