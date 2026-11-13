import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true, trim: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    image: { type: String, default: '' },
    unit: { type: String, default: 'Piece' },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0 },
    quantity: { type: Number, required: true, default: 1, min: 1 }
  }]
}, {
  timestamps: true,
  minimize: false
});

// Cart indexed by user via unique definition in schema

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart;
export { Cart };
