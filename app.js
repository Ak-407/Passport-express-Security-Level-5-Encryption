require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();


app.use(session({
  secret: 'i have a little secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());




mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/user3DB",{ useNewUrlParser: true , useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const UserSchema = mongoose.Schema({
  email:String,
  password:String
});

UserSchema.plugin(passportLocalMongoose);



const user = mongoose.model("user", UserSchema);

passport.use(user.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());


app.get("/", function(req,res){
    res.render("home");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.post("/register", function(req,res){
  user.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log("error");
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })

});

app.get("/secrets", function(req, res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }
})

app.post("/login", function(req,res){
  const nuser = new user({
    username:req.body.username,
    password:req.body.password
  });
  req.login(nuser, function(err){
    if(err){
      console.log("error");
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
 })

});
        

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/")
})




app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
