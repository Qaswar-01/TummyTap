const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create guest order (no authentication required)
router.post('/guest', [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('number').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits'),
  body('address').trim().isLength({ min: 1, max: 500 }).withMessage('Address is required'),
  body('paymentMethod').isIn(['cash on delivery', 'credit card', 'paypal']).withMessage('Invalid payment method'),
  body('items').isArray({ min: 1 }).withMessage('Order items are required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, number, address, paymentMethod, items } = req.body;

    // Validate and prepare order items
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Create guest order with automatic confirmation
    const order = new Order({
      user: null, // No user for guest orders
      isGuestOrder: true,
      name,
      email,
      number,
      address,
      paymentMethod,
      items: orderItems,
      totalPrice,
      status: 'confirmed', // Automatically confirm guest orders
      paymentStatus: paymentMethod === 'cash on delivery' ? 'pending' : 'completed'
    });

    await order.save();
    await order.populate('items.product', 'name price image category');

    res.status(201).json({
      message: 'Order placed successfully and automatically confirmed!',
      order,
      trackingInfo: {
        orderId: order._id,
        email: order.email,
        message: 'Your order has been automatically confirmed. You can track it using your order ID and email.'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track guest order (no authentication required)
router.get('/track/:orderId', [
  body('email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email } = req.query;

    const query = { _id: orderId };

    // If email is provided, verify it matches (for guest orders)
    if (email) {
      query.email = email;
    }

    const order = await Order.findOne(query)
      .populate('items.product', 'name price image category');

    if (!order) {
      return res.status(404).json({ message: 'Order not found or email does not match' });
    }

    // Return limited info for guest orders
    const orderInfo = {
      _id: order._id,
      name: order.name,
      email: order.email,
      number: order.number,
      address: order.address,
      paymentMethod: order.paymentMethod,
      items: order.items,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
      isGuestOrder: order.isGuestOrder,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    res.json(orderInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('number').isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits'),
  body('address').trim().isLength({ min: 1, max: 500 }).withMessage('Address is required'),
  body('paymentMethod').isIn(['cash on delivery', 'credit card', 'paypal']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, number, address, paymentMethod } = req.body;

    // Get cart items
    const cartItems = await Cart.find({ user: req.user._id }).populate('product');

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total and prepare order items
    let totalPrice = 0;
    const orderItems = cartItems.map(item => {
      const itemTotal = item.product.price * item.quantity;
      totalPrice += itemTotal;

      return {
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      };
    });

    // Create order
    const order = new Order({
      user: req.user._id,
      name,
      email,
      number,
      address,
      paymentMethod,
      items: orderItems,
      totalPrice
    });

    await order.save();

    // Clear cart
    await Cart.deleteMany({ user: req.user._id });

    await order.populate('items.product', 'name price image category');
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price image category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product', 'name price image category');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order (only if pending)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or cannot be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all orders
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email number')
      .populate('items.product', 'name price image category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Format orders to handle both guest and user orders
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      customerInfo: order.isGuestOrder ? {
        name: order.name,
        email: order.email,
        number: order.number,
        type: 'guest'
      } : {
        name: order.user?.name || 'Unknown',
        email: order.user?.email || 'Unknown',
        number: order.user?.number || 'Unknown',
        type: 'registered'
      }
    }));

    const total = await Order.countDocuments(query);

    res.json({
      orders: formattedOrders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update order status
router.put('/:id/status', adminAuth, [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('paymentStatus').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, paymentStatus } = req.body;
    const updateData = { status };

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email number')
      .populate('items.product', 'name price image category');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Format response to handle both guest and user orders
    const formattedOrder = {
      ...order.toObject(),
      customerInfo: order.isGuestOrder ? {
        name: order.name,
        email: order.email,
        number: order.number,
        type: 'guest'
      } : {
        name: order.user?.name || 'Unknown',
        email: order.user?.email || 'Unknown',
        number: order.user?.number || 'Unknown',
        type: 'registered'
      }
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;