import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler, ApiResponse } from '../utils/index.js';
import { ApiError } from '../utils/ApiError.js';

const MAX_ITEM_QTY = 999;

const sanitizeCartItems = async (rawItems = []) => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { items: [], repaired: false };
  }

  let repaired = false;
  const deduped = new Map();

  for (const raw of rawItems) {
    const it = raw?.toObject ? raw.toObject() : raw;
    const pId = String(it?.productId || it?._id || it?.product || '').trim();
    if (!pId) {
      repaired = true;
      continue;
    }

    let qty = Number(it.quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      qty = 1;
      repaired = true;
    }

    // Self-heal corrupted runaway quantities caused by legacy merge bug
    if (qty > MAX_ITEM_QTY) {
      qty = 1;
      repaired = true;
    }

    let maxAllowed = MAX_ITEM_QTY;
    let prodDoc = null;
    try {
      prodDoc = await Product.findById(pId).select('name price mrp unit brand images stock isActive deletedAt').lean();
    } catch {
      prodDoc = null;
    }

    if (prodDoc) {
      if (!prodDoc.isActive || prodDoc.deletedAt) {
        repaired = true;
        continue;
      }
      if (typeof prodDoc.stock === 'number' && prodDoc.stock > 0) {
        maxAllowed = Math.min(prodDoc.stock, MAX_ITEM_QTY);
      }
    }

    const boundedQty = Math.min(Math.max(1, Math.floor(qty)), maxAllowed);
    if (boundedQty !== Number(it.quantity)) {
      repaired = true;
    }

    if (deduped.has(pId)) {
      repaired = true;
      continue;
    }

    deduped.set(pId, {
      productId: pId,
      name: it.name || prodDoc?.name || 'Construction Material',
      brand: it.brand || prodDoc?.brand || '',
      image: it.image || (prodDoc?.images && prodDoc.images[0]) || '',
      unit: it.unit || prodDoc?.unit || 'Piece',
      price: Number(it.price) || Number(prodDoc?.price) || 0,
      mrp: Number(it.mrp) || Number(prodDoc?.mrp) || Number(it.price) || Number(prodDoc?.price) || 0,
      quantity: boundedQty
    });
  }

  return { items: Array.from(deduped.values()), repaired };
};

export const getCart = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required to access server cart.');
  const userId = String(req.user._id);

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  } else if (cart.items && cart.items.length > 0) {
    const { items, repaired } = await sanitizeCartItems(cart.items);
    if (repaired) {
      cart.items = items;
      await cart.save();
    }
  }

  return res.status(200).json(
    new ApiResponse(200, cart, 'Cart fetched successfully')
  );
});

export const syncCart = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Authentication required.');
  const userId = String(req.user._id);
  const { items: rawItems = [] } = req.body;

  const { items } = await sanitizeCartItems(rawItems);

  let cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart = await Cart.findByIdAndUpdate(cart._id, { items }, { new: true });
  } else {
    cart = await Cart.create({ user: userId, items });
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

  // First sanitize existing server cart items so corrupted quantities cannot compound
  const { items: cleanExisting } = await sanitizeCartItems(cart.items || []);

  const existingMap = new Map();
  cleanExisting.forEach(it => {
    existingMap.set(String(it.productId || it._id), { ...it });
  });

  for (const guestItem of items) {
    const pId = String(guestItem.productId || guestItem._id || guestItem.product || '').trim();
    if (!pId) continue;

    let guestQty = Number(guestItem.quantity) || 1;
    if (!Number.isFinite(guestQty) || guestQty < 1 || guestQty > MAX_ITEM_QTY) {
      guestQty = 1;
    }

    let pDoc = null;
    try {
      pDoc = await Product.findById(pId).select('name price mrp unit brand images stock isActive deletedAt').lean();
    } catch {
      pDoc = null;
    }

    const maxStock = (pDoc && typeof pDoc.stock === 'number' && pDoc.stock > 0)
      ? Math.min(pDoc.stock, MAX_ITEM_QTY)
      : MAX_ITEM_QTY;

    if (existingMap.has(pId)) {
      const existing = existingMap.get(pId);
      existing.quantity = Math.min(maxStock, (Number(existing.quantity) || 1) + Math.floor(guestQty));
    } else {
      const prodName = guestItem.name || pDoc?.name;
      const prodPrice = Number(guestItem.price) || Number(pDoc?.price) || 0;
      const prodUnit = guestItem.unit || pDoc?.unit || 'Piece';
      const prodBrand = guestItem.brand || pDoc?.brand || '';
      const prodImage = guestItem.image || (pDoc?.images && pDoc.images[0]) || '';

      existingMap.set(pId, {
        productId: pId,
        name: prodName || 'Construction Material',
        brand: prodBrand,
        image: prodImage,
        unit: prodUnit,
        price: prodPrice,
        mrp: Number(guestItem.mrp) || Number(pDoc?.mrp) || prodPrice,
        quantity: Math.min(maxStock, Math.max(1, Math.floor(guestQty)))
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
