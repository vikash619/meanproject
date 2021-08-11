require('dotenv').config();
const express = require("express");
const app = express();
require("./db/conn");
const Register = require("./models/registers");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require('./middleware/auth');
const port = process.env.PORT || 3000;


const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path  = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);

app.get("/",(req,res)=>{
    res.render("index");
})

app.get("/secret",(req,res)=>{
    // console.log(`this is cookies ${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/register", async (req,res)=>{
   try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(cpassword===password){
            const registerEmployee = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                gender : req.body.gender,
                phone : req.body.phone,
                age : req.body.age,
                password : password,
                confirmpassword : cpassword
            })

            console.log("the success part "+ registerEmployee);

            const token  = await registerEmployee.generateAuthToken();
            console.log("the token part "+ token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 600000),
                httpOnly:true
            });
            const registered = await registerEmployee.save();

            console.log("the page part "+ registered);
            res.status(201).render("index");
        }else{
            res.send("password are not matching")
        }
   }catch(error){
       res.status(400).send(error);
   }
})

app.post('/login', async (req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});
        
        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("the token part "+token);

        res.cookie("jwt", token, {
            expires:new Date(Date.now()+ 600000),
            httpOnly:true,
            // secure:true
        })

        if(isMatch){
            res.status(200).render("index");
        }else{
            res.send("invalid credential");
        }
    }catch(error){
        res.status(400).send("invalid credential")
    }
})
app.listen(port, ()=>{
    console.log(`server runing ${port}`);
})