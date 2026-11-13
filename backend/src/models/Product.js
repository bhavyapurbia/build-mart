import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: String, required: true, trim: true },
  subcategory: { type: String, trim: true },
  brand: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  unit: { type: String, default: 'Piece', trim: true },
  stock: { type: Number, default: 0, min: 0 },
  minOrderQty: { type: Number, default: 1, min: 1 },
  gstRate: { type: Number, default: 18, min: 0 },
  hsnCode: { type: String, default: '2523', trim: true },
  weightKg: { type: Number, default: 0, min: 0 },
  description: { type: String, default: '' },
  searchKeywords: [{ type: String }],
  specifications: [{ 
    key: { type: String, trim: true }, 
    value: { type: String, trim: true } 
  }],
  images: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isDeal: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0, min: 0 }
}, {
  timestamps: true,
  minimize: false
});

// Compound indexes as required by Appendix C
productSchema.index({ isActive: 1, category: 1, price: 1 });
productSchema.index({ isActive: 1, brand: 1 });
productSchema.index({ isDeal: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

// Text index for full text search with explicit field weights
productSchema.index(
  {
    name: 'text',
    brand: 'text',
    category: 'text',
    subcategory: 'text',
    sku: 'text',
    description: 'text',
    searchKeywords: 'text'
  },
  {
    weights: {
      name: 5,
      sku: 4,
      brand: 3,
      category: 2,
      subcategory: 2,
      description: 1,
      searchKeywords: 3
    },
    name: 'ProductTextIndex'
  }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
export { Product };
