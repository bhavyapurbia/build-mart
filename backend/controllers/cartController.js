const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user ? String(req.user._id) : req.headers['x-guest-id'] || 'guest-session';
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
};

exports.syncCart = async (req, res) => {
  try {
    const userId = req.user ? String(req.user._id) : req.headers['x-guest-id'] || 'guest-session';
    const { items } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart = await Cart.findByIdAndUpdate(cart._id, { items: items || [] }, { new: true });
    } else {
      cart = await Cart.create({ user: userId, items: items || [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error syncing cart', error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user ? String(req.user._id) : req.headers['x-guest-id'] || 'guest-session';
    await Cart.updateOne({ user: userId }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart', error: err.message });
  }
};

