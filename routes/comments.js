var express = require("express");
var router = express.Router({mergeParams : true});
var Campsite = require ("../models/campsite");
var Comment = require ("../models/comment");
var User = require("../models/user");



router.get("/new", isLoggedIn, function(req,res){
	Campsite.findById(req.params.id, function(err, campsite){
		if (err)
		{
			console.log(err);
		}
		else
		{	
			res.render("comments/new", {campsite : campsite});
		}
	})
});

router.post("/", isLoggedIn, function(req, res){
	Campsite.findById(req.params.id, function(err, campsite){
		if (err)
		{
			console.log(err);
			res.redirect("/campsites");
		} 
		else
		{
			Comment.create(req.body.comment, function(err, comment){
				if (err)
				{
					console.log(err);
				}
				else
				{

					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campsite.comments.push(comment);
					campsite.save();
					res.redirect("/campsites/" + campsite._id);
				}
			});
		}

	});
});



function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;