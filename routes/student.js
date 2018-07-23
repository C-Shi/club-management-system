var express = require("express");

var student = require("../models/student"),
    comment = require("../models/comment"),
    middlewareObj = require('../middleware');

var router  = express.Router();

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
router.post('/student', middlewareObj.isCoach, (req, res) => {
   var studentProfile = {
        name: {
          first: req.body.first,
          last: req.body.last,
        },
        fullName: req.body.first + " " + req.body.last,
        school: req.body.school,
        grade: req.body.grade,
        height: {
          feet: req.body.feet,
          inches: req.body.inches
        },
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
  student.create(studentProfile, (err)=> {
    if (err){
      console.log(err)
    }else{
      console.log("create a student profile named " + req.body.first + " " + req.body.last)
    }
  })
  res.redirect('/student')
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
        name:{
          first: req.body.first,
          last: req.body.last
        },
        school: req.body.school,
        grade: req.body.grade,
        height: {
          feet: req.body.feet,
          inches: req.body.inches
        },
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
        position: req.body.position
      };
  student.findByIdAndUpdate(req.params.id, studentProfile, (err, foundStudent) => {
    if(err){
      console.log(err)
    }else{
      console.log('updated');
    }
  })

  res.redirect('/student/' + req.params.id )
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