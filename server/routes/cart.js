const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.user._id })
      .populate('product', 'name price image category');
    
    res.json(cartItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', auth, [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already in cart
    let cartItem = await Cart.findOne({ user: req.user._id, product: productId });

    if (cartItem) {
      // Update quantity
      cartItem.quantity = Math.min(cartItem.quantity + quantity, 99);
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = new Cart({
        user: req.user._id,
        product: productId,
        quantity
      });
      await cartItem.save();
    }

    await cartItem.populate('product', 'name price image category');
    res.json(cartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/:id', auth, [
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quantity } = req.body;

    const cartItem = await Cart.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { quantity },
      { new: true }
    ).populate('product', 'name price image category');

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json(cartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/:id', auth, async (req, res) => {
  try {
    const cartItem = await Cart.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    await Cart.deleteMany({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cart count
router.get('/count', auth, async (req, res) => {
  try {
    const count = await Cart.countDocuments({ user: req.user._id });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;