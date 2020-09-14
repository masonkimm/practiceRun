const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const { route } = require('./comments');
const middleware = require('../middleware');
const nodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
const geocoder = nodeGeocoder(options);

//index route
router.get('/campgrounds', (req, res) => {
  // get all campgrounds from db
  Campground.find({}, function (err, allCampGrounds) {
    if (err) {
      console.log('error occured');
      console.log(err);
    } else {
      res.render('campgrounds/index', {
        campGrounds: allCampGrounds,
        currentUser: req.user,
      });
    }
  });
});

//show new campgrounds form
router.get('/campgrounds/new', middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});


//creating new campground to db
router.post('/campgrounds', middleware.isLoggedIn, (req, res) => {
  const name = req.body.name;
  const price = req.body.price;
  const image = req.body.image;
  const desc = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username,
  };
  // const newCampGround = {
  //   author: author,
  //   name: name,
  //   price: price,
  //   image: image,
  //   description: desc,
  // };

  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, price: price, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });

  //Create new campground and save it to db
  // Campground.create(newCampGround, function (err, newlyCreated) {
  //   if (err) {
  //     console.log('error occured');
  //     console.log(err);
  //   } else {
  //     //redirect back to campgrounds page
  //     // console.log(newlyCreated);
  //     res.redirect('/campgrounds');
  //   }
  // });
});

//SHOW - shows more info about one campground
router.get('/campgrounds/:id', (req, res) => {
  // find the campground with provided ID
  Campground.findById(req.params.id)
    .populate('comments')
    .exec(function (err, foundBlog) {
      if (err) {
        console.log(err);
      } else {
        // console.log(foundBlog);
        // render show template with that campground
        res.render('campgrounds/show', { campground: foundBlog });
      }
    });
});

//Edit campground
router.get('/campgrounds/:id/edit', middleware.checkCampgroungOwnership, (req, res) => {
  //is user logged in
  Campground.findById(req.params.id, (err, foundBlog) => {
    res.render('campgrounds/edit', { campground: foundBlog });
  });
});

// router.put('/campgrounds/:id', (req, res) => {
//   Campground.findByIdAndUpdate(
//     req.params.id,
//     req.body.campground,
//     (err, updatedCampground) => {
//       if (err) {
//         console.log(err);
//       } else {
//         res.redirect('/campgrounds/' + req.params.id);
//       }
//     }
//   );
// });
// UPDATE CAMPGROUND ROUTE
router.put('/campgrounds/:id', function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

router.delete('/campgrounds/:id', middleware.checkCampgroungOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err, foundBlog) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/campgrounds');
    }
  });
});


module.exports = router;
