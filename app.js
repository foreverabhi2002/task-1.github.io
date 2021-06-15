const express               = require("express"),
      bodyParser            = require("body-parser"),
      mongoose              = require("mongoose"),
      methodOverride        = require("method-override"),
      expressSanitizer      = require("express-sanitizer"),
      passport              = require("passport"),
      LocalStrategy         = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose"),
      passportOneSessionPerUser = require("passport-one-session-per-user"),
      User                  = require("./models/user"),
      Task                  = require("./models/task"),
      app                   = express(),
      PORT                  = process.env.PORT || 3000;

// App Config
mongoose.connect("mongodb+srv://userDB:foreverabhi@cluster0.lkukw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{
    useNewUrlParser:true, 
    useUnifiedTopology:true, 
    useFindAndModify: false
});
app.use(require("express-session")({
    secret: "foreverabhi",
    resave: false,
    saveUninitialized: false
}));
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new passportOneSessionPerUser());
app.use(passport.authenticate("passport-one-session-per-user"));

app.use(function(req,res,next)
{
    res.locals.currentUser = req.user;
    next();
});

// RESTFUL ROUTES
app.get("/",function(req,res)
{
    res.redirect("/task");
});

// INDEX ROUTE
app.get("/task",function(req,res)
{
    Task.find({},function(err,tasks)
    {
        if(err)
        {
            console.log("ERROR!!");
        }
        else
        {
            res.render("index",{tasks:tasks});
        }
    });
});

// NEW ROUTE
app.get("/task/new",isLoggedIn,function(req,res)
{
    res.render("new");
});

// CREATE ROUTES
app.post("/task",function(req,res)
{
    //Create Task
    Task.create(req.body.task,function(err,newTask)
    {
        if(err)
        {
            res.render("new");
        }
        else
        {
            //Redirect To Index
            res.redirect("/task");
        }
    });
});

// SHOW ROUTE 
app.get("/task/:id",function(req,res)
{
    Task.findById(req.params.id,function(err,foundTask){
        if(err)
        {
            res.redirect("/task");
        }
        else
        {
            res.render("show",{task:foundTask});
        }
    });
});

// EDIT ROUTE
app.get("/task/:id/edit",isLoggedIn,function(req,res)
{
    Task.findById(req.params.id,function(err,foundTask)
    {
        if(err)
        {
            res.redirect("/task");
        }
        else
        {
            res.render("edit",{task:foundTask});
        }
    });
});

// UPDATE ROUTE
app.put("/task/:id",function(req,res)
{
    req.body.task.body = req.sanitize(req.body.task.body);
    Task.findByIdAndUpdate(req.params.id,req.body.task,function(err,updatedTask)
    {
        if(err)
        {
            res.redirect("/task");
        }
        else
        {
            res.redirect("/task/" +req.params.id);
        }
    });
});

// DESTROY ROUTE
app.delete("/task/:id",isLoggedIn,function(req,res)
{
    //destroy task
    Task.findByIdAndRemove(req.params.id,function(err)
    {
        if(err)
        {
            res.redirect("/task");
        }
        else
        {
            res.redirect("/task");
        }
    });
    //redirect task somewhere
});


app.get("/secret",isLoggedIn,function(req,res){
    res.render("secret");
});

// Auth Routes
// Sign Up Form
app.get("/register",function(req,res){
    res.render("register");
});

// Handling User Sign Up
app.post("/register",function(req,res){
    req.body.username;
    req.body.password;
    User.register(new User({username:req.body.username}),
    req.body.password,
    function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secret");
        });
    });
});

// Log In Routes
// Render Login Form
app.get("/login",function(req,res){
    res.render("login");
});

// Log In Logic
// Middleware
app.post("/login",passport.authenticate("local",{
    successRedirect: "/task",
    failureRedirect: "/login"
}),function(req,res){});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

// PORT
app.listen(PORT,() =>{
    console.log(`Server started at http://localhost:${PORT}`);
});