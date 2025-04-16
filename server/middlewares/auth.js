const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
module.exports = async (req, res, next) => {
  try {

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      throw new Error();
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); 
    

    req.user = await User.findById(decoded.id); 
    if (!req.user) throw new Error();
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Not authorized' });
  }
};