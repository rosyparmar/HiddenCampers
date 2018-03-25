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

var commentRoutes = require("./routes/comments"),
campsiteRoutes = require("./routes/campsites"),
indexRoutes = require("./routes/index"),
userProfileRoute = require("./routes/user");

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


mongoose.connect("mongodb://localhost/hidden_campers");
app.set('port', process.env.PORT || 3000);

app.use (bodyParser.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

app.use(indexRoutes);
app.use("/campsites", campsiteRoutes);
app.use("/campsites/:id/comments", commentRoutes);
app.use("/user/", userProfileRoute);

app.listen(app.get('port'), function(){
	console.log ("Server started!");
});
