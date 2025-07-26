const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (Admin only)
router.post('/', adminAuth, upload.single('image'), [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Product name is required'),
  body('category').isIn(['fast food', 'main dish', 'drinks', 'desserts']).withMessage('Invalid category'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('description').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const { name, category, price, description } = req.body;

    // Check if product with same name exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    const product = new Product({
      name,
      category,
      price: parseFloat(price),
      image: req.file.filename,
      description: description || ''
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (Admin only)
router.put('/:id', adminAuth, upload.single('image'), [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('category').optional().isIn(['fast food', 'main dish', 'drinks', 'desserts']),
  body('price').optional().isNumeric(),
  body('description').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, price, description } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (price) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description;
    if (req.file) updateData.image = req.file.filename;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;