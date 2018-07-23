require('dotenv').config()

var express = require('express'),
    bodyParser     = require("body-parser"),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    seedDB = require('./seed'),
    session = require("express-session"),
    passport = require("passport"),
    user = require('./models/user'),
    flash = require('connect-flash'),
    request = require('request')
    LocalStrategy  = require("passport-local");

mongoose.connect("mongodb://localhost/football_v1");

var app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(flash())
// User Authenticate CONFIG - PASSPORT CONFIG -------------------------//
app.use(require("express-session")({
    secret: "Do you love me?",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// configure a new localStrategy and tell passport to use User.authenticate()
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


// -------------------------------------------------------------------//

// because useing user() method, this need to config after passport
app.use(function(req, res, next){
    // locals refers to whatever ejs file the request is getting to
    // this code ensure that in all ejs file we have access to the logged in user as "currentUser"
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get('/', (req, res) => {
  res.render('landing');
})

var studentRoute = require('./routes/student'),
    commentRoute = require('./routes/comment'),
    userRoute = require('./routes/user');

app.use(methodOverride("_method"));
app.use('/', studentRoute);
app.use('/', commentRoute);
app.use('/', userRoute);



app.listen(process.env.PORT || 3000, () => {
  console.log('server start')
})

// seedDB();