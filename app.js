require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const passport = require('passport');
const localStrategy = require('passport-local');
const methodOverride = require('method-override');
const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const indexRoutes = require('./routes/index');
const flash = require('connect-flash');

const User = require('./models/user');
const Campground = require('./models/campground');
const Comment = require('./models/comment');

const seedDB = require('./seeds');

mongoose.connect('mongodb://localhost/yelpCamp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());

// passport configuration
app.use(
  require('express-session')({
    secret: 'Secret page',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use(campgroundRoutes);
app.use(commentRoutes);
app.use(indexRoutes);

// to run the function when the page loads
// seedDB();

// Port Listener
app.listen(PORT, () => {
  console.log('Yelp-Camp App live at https://localhost:' + PORT);
});
