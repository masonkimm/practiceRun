const express = require('express');
const router = express.Router();
var Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware')




// comments new
router.get('/campgrounds/:id/comments/new', middleware.isLoggedIn, (req, res) => {
  // res.send("hi")
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      res.render('comments/new', { campground: foundCampground });
    }
  });
});

// comments create
router.post('/campgrounds/:id/comments', middleware.isLoggedIn, (req, res) => {
  //look up campground using ID
  Campground.findById(req.params.id, (err, campground) => {
    if (err) {
      console.log(err);
      res.redirect('/campgrounds');
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {

          console.log(err);
        } else {
          //add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();

          campground.comments.push(comment);
          campground.save();
          req.flash('success', "New Comment Added")
          res.redirect('/campgrounds/' + campground._id);
        }
      });
    }
  });
});

router.get('/campgrounds/:id/comments/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
  Comment.findById(req.params.comment_id, (err, foundComment) => {
    if (err) {
      res.redirect('back');
    } else {
      
      res.render('comments/edit', {
        comment: foundComment,
        campground_id: req.params.id,
      });
    }
  });
});

router.put('/campgrounds/:id/comments/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(
    req.params.comment_id,
    req.body.comment,
    (err, updatedComment) => {
      if (err) {
        res.redirect('back');
      } else {
        req.flash('success', "Comment Edited")
        res.redirect('/campgrounds/' + req.params.id);
      }
    }
  );
});

router.delete('/campgrounds/:id/comments/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err, foundCampground) => {
    if (err) {
      console.log(err);
    } else {
      req.flash('success', "Comment Deleted")
      res.redirect('/campgrounds/'+ req.params.id);
    }
  });
});

module.exports = router;
