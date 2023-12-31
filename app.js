//jshint esversion:6
const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
require('dotenv').config();
const PORT=process.env.PORT;

const session=require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');

app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://127.0.0.1:27017/userDB');
const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);
const User=mongoose.model('User', userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user, function(err){
        if(err){
            console.log(err.message);
        }else{
            passport.authenticate('local')(req, res, function(){
                res.redirect('/secrets');
            });
        }
    });


});

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render('secrets');
    }else{
        res.render('login');
    }
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    User.register({username:req.body.username}, req.body.password)
        .then(()=>{
            passport.authenticate('local')(req, res, function(){
                console.log("Success");
                res.redirect("/secrets");
            })
        }
            ).catch(err=>{console.log(err.message);});

});

app.get("/logout", function(req, res){
    req.logout(function(err){
        if(err){
            console.log(err.message);
        }else{
            res.redirect("/");
        }
    });
    
});

app.get("/submit", function(req, res){
    
});


app.listen(PORT, function(){
    console.log(`App listening to ${PORT}`);
});
