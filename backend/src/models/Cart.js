import { createUnifiedModel } from './dbAdapter.js';

const Cart = createUnifiedModel('Cart', {
  user: { type: String, required: true }, // userId or guest session token
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String },
    image: { type: String },
    unit: { type: String },
    price: { type: Number, required: true },
    mrp: { type: Number },
    quantity: { type: Number, required: true, default: 1 }
  }]
});

export default Cart;
export { Cart };

