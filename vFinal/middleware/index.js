// middleware page
const Campground = require('../models/campground')
const Comment = require('../models/comment')

const middlewareObj = {};

middlewareObj.checkCampgroungOwnership = (req, res, next) => {
  //is user logged in
  if (req.isAuthenticated()) {
    // find user's campground
    Campground.findById(req.params.id, (err, foundBlog) => {
      if (err) {
        req.flash('error', 'Campground not found')
        console.log(err);
      } else {
        if (foundBlog.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash('error', 'Access Denied')
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('error', 'Login Required')
    res.redirect('back');
  }
};

middlewareObj.checkCommentOwnership = (req, res, next) => {
  //is user logged in
  if (req.isAuthenticated()) {
    // find user's Comment
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        
        res.redirect('back');
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash('error', 'Access Denied')
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('error', 'Login Required')
    res.redirect('back');
  }
};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Login Required")
  res.redirect('/login');
};

module.exports = middlewareObj;
