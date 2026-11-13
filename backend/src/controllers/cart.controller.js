import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler, ApiResponse } from '../utils/index.js';
import { ApiError } from '../utils/ApiError.js';

export const getCart = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required to access server cart.');
  const userId = String(req.user._id);

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return res.status(200).json(
    new ApiResponse(200, cart, 'Cart fetched successfully')
  );
});

export const syncCart = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required.');
  const userId = String(req.user._id);
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

export const mergeCart = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required.');
  const userId = String(req.user._id);
  const items = req.body.items || req.body.guestItems || [];

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const existingMap = new Map();
  (cart.items || []).forEach(it => {
    existingMap.set(String(it.productId || it._id), it.toObject ? it.toObject() : it);
  });

  for (const guestItem of items) {
    const pId = String(guestItem.productId || guestItem._id || guestItem.product);
    if (!pId) continue;

    if (existingMap.has(pId)) {
      const existing = existingMap.get(pId);
      existing.quantity = (existing.quantity || 1) + (Number(guestItem.quantity) || 1);
    } else {
      let prodName = guestItem.name;
      let prodPrice = Number(guestItem.price) || 0;
      let prodUnit = guestItem.unit || 'Piece';
      let prodBrand = guestItem.brand || '';
      let prodImage = guestItem.image || '';

      if (!prodName || !prodPrice) {
        const pDoc = await Product.findById(pId).select('name price unit brand images').lean();
        if (pDoc) {
          prodName = prodName || pDoc.name;
          prodPrice = prodPrice || pDoc.price;
          prodUnit = prodUnit || pDoc.unit;
          prodBrand = prodBrand || pDoc.brand;
          prodImage = prodImage || (pDoc.images && pDoc.images[0]) || '';
        }
      }

      existingMap.set(pId, {
        productId: pId,
        name: prodName || 'Construction Material',
        brand: prodBrand,
        image: prodImage,
        unit: prodUnit,
        price: prodPrice,
        mrp: Number(guestItem.mrp) || prodPrice,
        quantity: Math.max(1, Number(guestItem.quantity) || 1)
      });
    }
  }

  cart.items = Array.from(existingMap.values());
  await cart.save();

  return res.status(200).json(
    new ApiResponse(200, cart, 'Guest cart merged successfully')
  );
});

export const validateCart = asyncHandler(async (req, res) => {
  const { items = [] } = req.body;
  const changes = [];
  const validatedItems = [];

  for (const item of items) {
    const pId = item.productId || item._id || item.product;
    const product = await Product.findById(pId).lean();

    if (!product || !product.isActive || product.deletedAt) {
      changes.push({
        productId: pId,
        name: item.name,
        type: 'removed',
        message: `"${item.name || 'Item'}" is no longer available and was removed.`
      });
      continue;
    }

    const availableStock = product.stock || 0;
    const currentPrice = Number(product.price) || 0;
    const oldPrice = Number(item.price) || 0;

    let qty = Number(item.quantity) || 1;
    if (availableStock <= 0) {
      changes.push({
        productId: pId,
        name: product.name,
        type: 'out_of_stock',
        message: `"${product.name}" is currently out of stock.`
      });
      continue;
    } else if (qty > availableStock) {
      qty = availableStock;
      changes.push({
        productId: pId,
        name: product.name,
        type: 'insufficient_stock',
        availableStock,
        message: `"${product.name}" quantity adjusted to maximum available stock (${availableStock}).`
      });
    }

    if (oldPrice !== currentPrice && oldPrice > 0) {
      changes.push({
        productId: pId,
        name: product.name,
        type: 'price_changed',
        oldPrice,
        newPrice: currentPrice,
        message: `"${product.name}" price updated from ₹${oldPrice} to ₹${currentPrice}.`
      });
    }

    validatedItems.push({
      ...item,
      productId: String(product._id),
      _id: String(product._id),
      name: product.name,
      brand: product.brand,
      price: currentPrice,
      mrp: product.mrp || currentPrice,
      unit: product.unit,
      quantity: qty,
      stock: availableStock
    });
  }

  return res.status(200).json(
    new ApiResponse(200, {
      items: validatedItems,
      changes,
      alerts: changes,
      hasChanges: changes.length > 0
    }, 'Cart validated successfully')
  );
});

export const clearCart = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required.');
  const userId = String(req.user._id);
  await Cart.updateOne({ user: userId }, { items: [] });
  return res.status(200).json(
    new ApiResponse(200, null, 'Cart cleared successfully')
  );
});

export default {
  getCart,
  syncCart,
  mergeCart,
  validateCart,
  clearCart
};
