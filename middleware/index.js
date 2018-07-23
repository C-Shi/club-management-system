var student = require("../models/student"),
    comment    = require("../models/comment"),
    user    =   require("../models/user");


var middlewareObj = new Object();


middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                console.log("no comment found");
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user.id)){
                    return next();
                }else{
                    req.flash("error", "Sorry! You are not the author of this comment");
                    res.redirect("back");
                }
            }
        })
    }else{
        req.flash("error", "Sorry! You need to log in first");
        res.redirect("back");
    }
}

middlewareObj.isCoach = function(req, res, next){
    if(req.isAuthenticated()){
        if(!req.user.isCoach){
            req.flash("error", "Sorry! Only coach is allowed to do this");
            res.redirect("back");
        }else{
            return next();
        }
    }else{
        req.flash("error", "Sorry! You need to Login as a Coach");
        res.redirect('/login')
    }
}

middlewareObj.isAdmin = function(req, res, next){
    if(req.isAuthenticated()){
        if(!req.user.isAdmin){
            req.flash("error", "Sorry! Only Admin is allowed to do this");
            res.redirect('back')
        }else{
            return next();
        }
    }else{
        req.flash("error", "Sorry! You need to Login as an Admin");
        res.redirect('/login')
    }
}


module.exports = middlewareObj;