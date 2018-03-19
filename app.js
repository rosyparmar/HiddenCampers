var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    Campsite  = require("./models/campsite"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");

//Passport Config
app.use(require("express-session")({
    secret: "HiddenCampers rock!!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


// mongoose.connect("mongodb://localhost/hidden_campers")
mongoose.connect("mongodb://sarthak:hiddencampers@ds117749.mlab.com:17749/hiddencampersdb");

// app.set('port', process.env.PORT || 3000);
app.use (bodyParser.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();


app.get("/", function(req,res){
	Campsite.find({}, function(err, allCampsites){
		if (err){
			console.log(err);
		}
		else
			res.render("campsites/index",{campsites : allCampsites});
	});
});  


app.get("/campsites", function(req,res){

	Campsite.find({}, function(err, allCampsites){
		if (err){
			console.log(err);
		}
		else
			res.render("campsites/index",{campsites : allCampsites, currentUser : req.user});
	});
});

app.post("/campsites", isLoggedIn,  function(req, res){
	var name =req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var newCampsite = {name: name, image : image, description: desc};
	Campsite.create(newCampsite, function(err, newlyCreatedCampsite){
		if (err){
			console.log(err);
		}
		else
			res.redirect("/campsites");
	});	
});


app.get("/campsites/add", isLoggedIn, function(req,res){
	res.render("campsites/new");
});


app.get("/campsites/:id", function(req,res){
	Campsite.findById(req.params.id).populate("comments").exec(function(err, foundCampsite){
		if(err){
			console.log(err);
		} else {
			res.render("campsites/show", {campsite : foundCampsite});
		}
	});
});


app.get("/campsites/:id/comments/new", isLoggedIn, function(req,res){
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

app.post("/campsites/:id/comments", isLoggedIn, function(req, res){
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
					campsite.comments.push(comment);
					campsite.save();
					res.redirect("/campsites/" + campsite._id);
				}
			});
		}

	});
});


// Auth Routes

app.get("/login", function(req,res){
	res.render("login");
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campsites",
        failureRedirect: "/login"
    }), function(req, res){
});

app.get("/password_reset", function(req, res){
	res.render("passreset");
});

app.get("/register", function(req, res){
	res.render("register");
});

app.post("/register", function(req, res){
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

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/campsites");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
	console.log ("Server started!");
});
