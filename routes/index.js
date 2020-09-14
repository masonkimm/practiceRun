const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

//root route
router.get('/', (req, res) => {
  res.render('landing');
});

//show register form
router.get('/register', (req, res) => {
  res.render('register');
});

//sign up logic
router.post('/register', (req, res) => {
  const newUser = new User({ username: req.body.username });
  const newUserPw = req.body.password;

  User.register(newUser, newUserPw, (err, user) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('register');
    } else {
      passport.authenticate('local')(req, res, () => {
        req.flash(
          'success',
          'Sign Up Successful \n Welcome to Yelpcamp ' + user.username
        );
        res.redirect('/campgrounds');
      });
    }
  });
});

//show login page
router.get('/login', (req, res) => {
  res.render('login');
});

//login logic
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
  }),
  (err, res) => {}
);

//logout route
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Logged out');
  res.redirect('/campgrounds');
});

module.exports = router;
