var express = require("express");
var router = express.Router();
var Campsite = require ("../models/campsite");


router.get("/", function(req,res){
	if (req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campsite.find({location : regex}, function(err, allCampsites){
			if (err){
				console.log(err);
			}
			else
				res.render("campsites/index",{campsites : allCampsites, currentUser : req.user});
		});
	}
	else
	{

		Campsite.find({}, function(err, allCampsites){
			if (err){
				console.log(err);
			}
			else
				res.render("campsites/index",{campsites : allCampsites, currentUser : req.user});
		});
	}
});


router.post("/", isLoggedIn,  function(req, res){
	var name =req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var location = req.body.location;
	var author = {
		id : req.user._id,
		username : req.user.username
	};
	var newCampsite = {name: name, image : image, description: desc, author: author, location : location};
	Campsite.create(newCampsite, function(err, newlyCreatedCampsite){
		if (err){
			console.log(err);
		}
		else
			res.redirect("/campsites");
	});	
});



router.get("/:id/edit", isLoggedIn,  function(req, res){
	Campsite.findById(req.params.id, function(err, foundCampsite){
		res.render("campsites/edit", {campsite : foundCampsite});
	});
});


router.put("/:id", function(req,res){
	Campsite.findByIdAndUpdate(req.params.id, req.body.campsite, function(err, updatedCampsite){
		if (err){
			res.redirect("/campsites");
		}
		res.redirect("/campsites/" + req.params.id);
	})
})

router.delete("/:id", function(req, res){
	Campsite.findByIdAndRemove(req.params.id, function(err){
		if (err){
			res.redirect("/campsites");
		}
		else
		{
			res.redirect("/campsites");
		}

	});
});



router.get("/add", isLoggedIn, function(req,res){
	res.render("campsites/new");
});


router.get("/:id", function(req,res){
	Campsite.findById(req.params.id).populate("comments").exec(function(err, foundCampsite){
		if(err){
			console.log(err);
		} else {
			res.render("campsites/show", {campsite : foundCampsite});
		}
	});
});


function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};



module.exports = router;