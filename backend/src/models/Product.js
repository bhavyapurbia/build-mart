import { createUnifiedModel } from './dbAdapter.js';

const Product = createUnifiedModel('Product', {
  name: { type: String, required: true },
  slug: { type: String, required: true },
  sku: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  unit: { type: String, default: 'Piece' },
  stock: { type: Number, default: 50 },
  minOrderQty: { type: Number, default: 1 },
  description: { type: String },
  specifications: [{ key: String, value: String }],
  images: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isDeal: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 12 }
});

export default Product;
export { Product };

