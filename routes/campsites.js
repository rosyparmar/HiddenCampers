var express = require("express");
var router = express.Router();
var Campsite = require ("../models/campsite");

//Viewing all campsites, homepage
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


//Creating a new campsite, GET
router.get("/add", isLoggedIn, function(req,res){
	res.render("campsites/new");
});

//Creating a new campsite, POST
router.post("/", isLoggedIn,  function(req, res){
	var name =req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var location = req.body.location;
    var features = req.body.features;
    var activities = req.body.activities;
	var author = {
		id : req.user._id,
		username : req.user.username
	};
	var newCampsite = {name: name, image : image, description: desc, author: author, location : location, features: features, activities: activities};
	Campsite.create(newCampsite, function(err, newlyCreatedCampsite){
		if (err){
			console.log(err);
		}
		else
			res.redirect("/campsites");
	});	
});



// Show campsite
router.get("/:id", function(req,res){
	Campsite.findById(req.params.id).populate("comments").exec(function(err, foundCampsite){
		if(err){
			console.log(err);
		} else {
			res.render("campsites/show", {campsite : foundCampsite});
		}
	});
});


//Editing a campsite
router.get("/:id/edit", campsiteOwnershipAuthentication,  function(req, res){
	Campsite.findById(req.params.id, function(err, foundCampsite){
		res.render("campsites/edit", {campsite : foundCampsite});
	});
});


//Updating a campsite
router.put("/:id", campsiteOwnershipAuthentication, function(req,res){
	Campsite.findByIdAndUpdate(req.params.id, req.body.campsite, function(err, updatedCampsite){
		if (err){
			res.redirect("/campsites");
		}
		res.redirect("/campsites/" + req.params.id);
	})
})


//Deleting a campsite
router.delete("/:id", campsiteOwnershipAuthentication, function(req, res){
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




//************ Middleware Functions :  **************

//Authentication to verify if the user is a campsite's owner
function campsiteOwnershipAuthentication(req, res, next){
	if(req.isAuthenticated()){
		Campsite.findById(req.params.id, function(err, foundCampground){
			if(err){
				res.redirect("back");
			}  else {
               if(foundCampground.author.id.equals(req.user._id)) {
               	next();
               } else {
               	res.redirect("back");
               }
           }
       });
	} else {
		res.redirect("back");
	}
}


//Authentication to verify if the user is logged in
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

//Search
function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;