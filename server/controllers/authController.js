const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.decode(token);
    
    let user = await User.findOne({ email: decoded.email });
    
    if (!user) {
      user = new User({
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.picture,
        googleId: decoded.sub
      });
      await user.save();
      await sendWelcomeEmail(user.email, user.name);
    }

    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token: authToken, user });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};