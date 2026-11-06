import { createUnifiedModel } from './dbAdapter.js';

const Category = createUnifiedModel('Category', {
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  icon: { type: String },
  subcategories: [{
    name: String,
    slug: String,
    description: String
  }],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

export default Category;
export { Category };

