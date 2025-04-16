const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

router.post('/google', authController.googleAuth);
router.get('/me', passport.authenticate('jwt', { session: false }), authController.getMe);


router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: false
}), (req, res) => {
  res.redirect(`${process.env.BASE_URL}?token=${req.user.token}`);
});

module.exports = router;