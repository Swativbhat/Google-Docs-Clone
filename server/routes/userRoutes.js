const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Get user profile
router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -googleId')
      .populate('documents', 'title updatedAt')
      .populate('sharedDocuments', 'title updatedAt');

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, avatar },
      { new: true, select: '-password -googleId' }
    );

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search for users by email (for sharing documents)
router.get('/search', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || email.length < 3) {
      return res.status(400).json({ message: 'Please provide at least 3 characters to search' });
    }

    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user.id }
    }).select('name email avatar').limit(10);

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;