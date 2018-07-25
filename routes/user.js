
var express = require("express");
var router  = express.Router();
var passport = require("passport");
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var flash = require("connect-flash");
var user = require("../models/user");
var middlewareObj = require('../middleware');



// expressRoute 是一个可以吧路由组合起来输出到其他文件的插件

// User Authenticate Routes **************
// display register form
router.get("/register", middlewareObj.isAdmin, (req, res) => {
    res.render("register");
})

router.post("/register", (req,res) =>{
    user.register(user({username:req.body.username, isAdmin: req.body.admin, isCoach: req.body.coach, email:req.body.email}), req.body.password, (err, user) => {
        if(err){
            console.log(err)
            return res.redirect("/register");
        }

        // After register we do not want to immediate login in user
        res.redirect("/student");

    })
})

// User Login Routes ********************
router.get('/login', (req,res) => {
    res.render("login");
})

router.post("/login", passport.authenticate("local", {
    successRedirect: "/student",
    failureRedirect: "/login",
    // successFlash/failureFlash automatically pass key of "success" and "error", not other key
}), function (req, res){
})

// User Logout Routes ********************
router.get("/logout", (req,res) => {
    req.logout();
    res.redirect("/");
})

// forget password and password reset route
router.get('/forgot', (req, res) => {
    res.render('forgot');
})

// send confirmation emails
router.post("/forgot", (req, res, next) => {
  // use waterfall to increase readability of the following callbacks
  async.waterfall([
    function(done) {
      // generate random token
      crypto.randomBytes(20, (err, buf) => {
        let token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      // find who made the request and assign the token to them
      user.findOne({ email: req.body.email, username: req.body.username }, (err, foundUser) => {
        if (err) throw err;
        if (!foundUser) {
          req.flash("error", "The email or the account does not exist or not associated");
          return res.redirect("/forgot");
        }

        foundUser.resetPasswordToken = token;
        foundUser.resetPasswordExpires = Date.now() + 3600000; // ms, 1hour

        foundUser.save(err => done(err, token, foundUser));
      });
    },
    function(token, foundUser, done) {
      // indicate email account and the content of the confirmation letter
      let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "kyleshi82@gmail.com",
          pass: process.env.GMAILPW
        }
      });
      let mailOptions = {
        from: "kyleshi82@gmail.com",
        to: foundUser.email,
        subject: "Reset your Football Club Password",
        text: "Hi " + foundUser.username + ",\n\n" +
              "We've received a request to reset your password. If you didn't make the request, just ignore this email. Otherwise, you can reset your password using this link:\n\n" +
              "https://" + req.headers.host + "/reset/" + token + "\n\n" +
              "Thanks.\n"+
              "The YelpCamp Team\n"
      };
      // send the email
      smtpTransport.sendMail(mailOptions, err => {
        if (err) throw err;
        console.log("mail sent");
        req.flash("success", "An email has been sent to " + foundUser.email + " with further instructions.");
        done(err, "done");
      });
    }
  ], err => {
    if (err) return next(err);
    res.redirect("/forgot");
  });
});

// reset password ($gt -> selects those documents where the value is greater than)
router.get("/reset/:token", (req, res) => {
  user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, foundUser) => {
    if (err) throw err;
    if (!foundUser) {
      req.flash("error", "Password reset token is invalid or has expired.");
      res.redirect("/forgot");
    } else { res.render("reset", { token: req.params.token }) }
  });
});

// update password
router.post("/reset/:token", (req, res) => {
  async.waterfall([
    function(done) {
      user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, foundUser) => {
        if (err) throw err;
        if (!foundUser) {
          req.flash("error", "Password reset token is invalid or has expired.");
          return res.redirect("/forgot");
        }
        // check password and confirm password
        if (req.body.password === req.body.confirm) {
          // reset password using setPassword of passport-local-mongoose
          foundUser.setPassword(req.body.password, err => {
            if (err) throw err;
            foundUser.resetPasswordToken = null;
            foundUser.resetPasswordExpires = null;

            foundUser.save(err => {
              if (err) throw err;
              req.logIn(foundUser, err => {
                done(err, foundUser);
              });
            });
          });
        } else {
          req.flash("error", "Passwords do not match");
          return res.redirect("back");
        }
      });
    },
    function(foundUser, done) {
      let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "kyleshi82@gmail.com",
          pass: process.env.GMAILPW
        }
      });
      let mailOptions = {
        from: "kyleshi82@gmail.com",
        to: foundUser.email,
        subject: "Your Football Club Password has been changed",
        text: "Hi " + foundUser.username + ",\n\n" +
              "This is a confirmation that the password for your account " + foundUser.email + "  has just been changed.\n\n" +
              "Best,\n"+
              "The YelpCamp Team\n"
      };
      smtpTransport.sendMail(mailOptions, err => {
        if (err) throw err;
        req.flash("success", "Your password has been changed.");
        done(err);
      });
    },
  ], err => {
    if (err) throw err;
    res.redirect("/student");
  });
});

// END OF ROUTES ******************************************

module.exports = router;