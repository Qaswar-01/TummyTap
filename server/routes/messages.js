const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('number').isLength({ min: 10, max: 12 }).withMessage('Phone number must be 10-12 digits'),
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message is required and must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, number, message } = req.body;

    const newMessage = new Message({
      user: req.user._id,
      name,
      email,
      number,
      message
    });

    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all messages
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const query = {};

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const messages = await Message.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);

    res.json({
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Mark message as read
router.put('/:id/read', adminAuth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    ).populate('user', 'name email');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete message
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;