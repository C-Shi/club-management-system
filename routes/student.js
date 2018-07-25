var express = require("express");

var student = require("../models/student"),
    comment = require("../models/comment"),
    middlewareObj = require('../middleware');

var router  = express.Router();

// config image upload to cloudinary **************************
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'dhi1ngld5',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// ******************************************************

// show all student player as a list
router.get('/student', (req,res) => {
  // add fluzzy search function ***************
  // check if target contains serach query will return
  if (req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    student.find({fullName: regex}).sort({school:1}).exec((err, foundStudent) => {
      if(err){
        console.log(err)
      }else{
        res.render('studentList',{student:foundStudent})
      }
    })
    // **********************************
  }else{
    student.find({}).sort({school: 1}).exec((err, foundStudent) => {
      if(err){
        console.log(err)
      }else{
        res.render('studentList', {student:foundStudent})
      }
    })
  }
})

// render form to create a new student player
router.get('/student/new', middlewareObj.isCoach, (req,res) => {
  res.render('newStudent')
})

// post player profile to database
router.post('/student', middlewareObj.isCoach, upload.single('image'), (req, res) => {
   // upload student image will be done in a differnt fucntion inside this post route

   var studentProfile = {
        name: {
          first: req.body.first,
          last: req.body.last,
        },
        fullName: req.body.first + " " + req.body.last,
        school: req.body.school,
        grade: req.body.grade,
        height: req.body.height,
        weight: req.body.weight,
        armSpan: req.body.armSpan,
        benchPress: req.body.benchPress,
        broad: req.body.broad,
        vertical: req.body.vertical,
        forty: {
          first: req.body.fortyFirst,
          second: req.body.fortySecond
        },
        shuttle: {
          firstL: req.body.shuttleFirst,
          secondR: req.body.shuttleSecond
        },
        position: req.body.position,
        strength: req.body.strength,
        weakness: req.body.weakness
  };

      var img = req.file ? req.file.path : "https://res.cloudinary.com/dhi1ngld5/image/upload/v1532544942/default_avatar.png"
      cloudinary.uploader.upload(img, (result) =>  {
        // add cloudinary url for the image to the campground object under image property
        console.log(result);
        req.body.image = result.secure_url;
        req.body.imageId = result.public_id;
        // plugin student's image to student Profile
        studentProfile.image = req.body.image;
        studentProfile.imageId = req.body.imageId;

        student.create(studentProfile, (err, thisStudent)=> {
          if (err){
            req.flash('err', err.message)
            return res.redirect('back')
          }else{
            console.log("create a student profile named " + req.body.first + " " + req.body.last);
          }
        })
        res.redirect('/student');
      });
})


// retrieve info for an individual student
router.get('/student/:id', (req, res) => {
  student.findById(req.params.id).populate('comment').exec((err, foundStudent) => {
    if(err){
      console.log(err)
    }else{
      res.render('student',{student:foundStudent});
    }
  })
})

// get a student's profile for editiing
router.get('/student/:id/edit', middlewareObj.isCoach, (req, res) => {
  student.findById(req.params.id, (err, foundStudent) => {
    if(err){
      console.log(err)
    }else{
      res.render('editStudent',{student:foundStudent});
    }
  })
})

// update student's profile
router.put('/student/:id', middlewareObj.isCoach, (req, res) => {
   var studentProfile = {
        name: {
          first: req.body.first,
          last: req.body.last,
        },
        school: req.body.school,
        grade: req.body.grade,
        height: req.body.height,
        weight: req.body.weight,
        armSpan: req.body.armSpan,
        benchPress: req.body.benchPress,
        broad: req.body.broad,
        vertical: req.body.vertical,
        forty: {
          first: req.body.fortyFirst,
          second: req.body.fortySecond
        },
        shuttle: {
          firstL: req.body.shuttleFirst,
          secondR: req.body.shuttleSecond
        },
  };
  // locate the student we want to edit
  student.findByIdAndUpdate(req.params.id, studentProfile, (err, foundStudent) => {
    if(err){
      req.flash("error", err.message);
      res.redirect("back");
    }else{
      console.log('updated');
    }
  })
  res.redirect('/student/' + req.params.id )
})

//edit student image profile
router.get("/student/:id/image", middlewareObj.isCoach, (req, res) => {
  student.findById(req.params.id, (err, foundStudent) => {
    if(err){
      req.flash("error", err.message);
      res.redirect("back");
    }else{
      res.render("image", {student:foundStudent})
    }
  })
})

router.put("/student/:id/image", middlewareObj.isCoach, upload.single('image'), (req, res) => {
  student.findById(req.params.id, (err, foundStudent) => {
    if(err){
      req.flash("error", err.message);
      res.redirect("back")
    }else{
      cloudinary.v2.uploader.destroy(foundStudent.imageId, (err) => {
        if(err){
          req.flash("error", err.message)
          return res.redirect("back")
        }
        var img;
        if(req.file) {
          img = req.file.path
        }else {
          img = "https://res.cloudinary.com/dhi1ngld5/image/upload/v1532544942/default_avatar.png"
        }

        cloudinary.v2.uploader.upload(img, (err, result) => {
          if(err){
            req.flash("error", err.message)
            return res.redirect("back")
          }
          foundStudent.imageId = result.public_id;
          foundStudent.image = result.secure_url;
          foundStudent.save();
          res.redirect("/student/" + req.params.id)
        })
      })
    }
  })
})


// remove student profile
router.delete('/student/:id', middlewareObj.isCoach, (req, res) => {
  student.findByIdAndRemove(req.params.id, (err, foundStudent) => {
    if(err){
      console.log(err)
    }else{
      res.redirect('/student');
    }
  })
})

router.put('/student/:id/strength', middlewareObj.isCoach, (req, res) => {
  student.findByIdAndUpdate(req.params.id, {strength: req.body.strength}, (err, foundStudent) => {
    if(err){
      console.log(err)
    }else{
      res.redirect('back');
    }
  })
})

router.put('/student/:id/weakness', middlewareObj.isCoach, (req, res) => {
  student.findByIdAndUpdate(req.params.id, {weakness: req.body.weakness}, (err, foundStudent) => {
    if(err){
      console.log(err)
    }else{
      res.redirect('back');
    }
  })
})


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;