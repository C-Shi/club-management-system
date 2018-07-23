var express = require("express");
// {mergeParams:true} -- perseve the req.params info from the parent router, in this case, app.use("/campground/:id/comment") in the app.js
var router  = express.Router({mergeParams:true});
var student = require("../models/student");
var comment = require("../models/comment");
var middlewareObj = require('../middleware');
// var middlewareObj = require("../middleware");

// ========== NESTED ROUTES FOR COMMENTS ===============

// // NEW routes - display form to make commets
// router.get("/new", middlewareObj.isLogin, function(req,res){
//     //find Campground's id not the req's id
//     campground.findById(req.params.id, function(err, campground){
//         if(err){
//             console.log("No such campground");
//             res.redirect("/campground");
//         }else{
//             res.redirect("comments/show", {campground:campground});
//         }
//     })
// })

// CREATE routes - add new comments to student
router.post("/student/:id/comment", middlewareObj.isCoach, function(req, res){
    //findID
    student.findById(req.params.id, function(err, foundStudent){
        if(err){
            console.log(err)
        }else{
            comment.create(req.body.comment, function(err,comment){
                if(err){
                    console.log(err);
                }else{
                    comment.author.username = req.user.username;
                    comment.author.id       = req.user.id;
                    comment.save();
                    foundStudent.comment.push(comment);
                    foundStudent.save();
                    res.redirect("/student/" + req.params.id);
                }
            })
        }
    })
    //Redirect
})


// Delete comments
router.delete("/student/:id/comment/:comment_id", middlewareObj.checkCommentOwnership, function(req,res){
    comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log("cannot find comment");
        }else{
            res.redirect("back");
        }
    });
});
// ========== END NESTED ROUTES FOR COMMENTS ===========

module.exports = router;