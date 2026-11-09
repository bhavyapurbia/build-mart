import Cart from '../models/Cart.js';
import { asyncHandler, ApiResponse } from '../utils/index.js';

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user ? String(req.user._id) : req.headers['x-guest-id'] || 'guest-session';
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return res.status(200).json(
    new ApiResponse(200, cart, 'Cart fetched successfully')
  );
});

export const syncCart = asyncHandler(async (req, res) => {
  const userId = req.user ? String(req.user._id) : req.headers['x-guest-id'] || 'guest-session';
  const { items } = req.body;

  let cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart = await Cart.findByIdAndUpdate(cart._id, { items: items || [] }, { new: true });
  } else {
    cart = await Cart.create({ user: userId, items: items || [] });
  }

  return res.status(200).json(
    new ApiResponse(200, cart, 'Cart synced successfully')
  );
});

export const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user ? String(req.user._id) : req.headers['x-guest-id'] || 'guest-session';
  await Cart.updateOne({ user: userId }, { items: [] });
  return res.status(200).json(
    new ApiResponse(200, null, 'Cart cleared successfully')
  );
});

export default {
  getCart,
  syncCart,
  clearCart
};
