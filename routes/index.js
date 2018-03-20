var express = require("express");
var router = express.Router();
var passport = require("passport");
var Campsite = require ("../models/campsite");
var User = require("../models/user");


router.get("/", function(req,res){
	let noMatch = null;
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campsite.find({name: regex}, function(err, allCampsites) {
			if (err) { console.log(err); }
			else {
				if (allCampsites.length < 1) {
					noMatch = "No campgrounds found, please try again.";
				}
				res.render("campsites/index", { campsites: allCampsites, page: "campsites", noMatch: noMatch });  
			}
		});
	} else {
    // Get all camgrounds from DB
    Campsite.find({}, function(err, allCampsites) {
    	if (err) { console.log(err); }
    	else {
    		res.render("campsites/index", { campsites: allCampsites, page: "campsites", noMatch: noMatch });  
    	}
    }); 
}

});  

// Auth Routes

router.get("/login", function(req,res){
	res.render("login");
});

router.post("/login", passport.authenticate("local", 
{
	successRedirect: "/campsites",
	failureRedirect: "/login"
}), function(req, res){
});

router.get("/password_reset", function(req, res){
	res.render("passreset");
});

router.get("/register", function(req, res){
	res.render("register");
});

router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/campsites"); 
		});
	});
});

router.get("/logout", function(req, res){
	req.logout();
	res.redirect("/campsites");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


module.exports = router;