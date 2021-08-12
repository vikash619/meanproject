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
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/secret", auth, (req, res) => {
    // console.log(`this is cookies ${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/logout", auth, (req, res) => {
    try {

        //single device logout
        // console.log(req.user);

        // req.user.tokens = req.user.tokens.filter((currElement)=>{
        //     return currElement.token != req.token;
        // })

        //all device logout
        req.user.tokens = [];
        res.clearCookie("jwt");


        console.log("logout successfully");
        await = req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send("error in logout");
    }
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (cpassword === password) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword
            })

            console.log("the success part " + registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            console.log("the token part " + token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 600000),
                httpOnly: true
            });
            const registered = await registerEmployee.save();

            console.log("the page part " + registered);
            res.status(201).render("index");
        } else {
            res.send("password are not matching")
        }
    } catch (error) {
        res.status(400).send(error);
    }
})

app.post('/login', async (req, res) => {
    try {
        // const id = req.body._id;
        // console.log(id);
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });
        console.log(useremail.id);
        const id = useremail.id;

        const isMatch = await bcrypt.compare(password, useremail.password);
        console.log(isMatch);
        // console.log(req.body);
        const token = await useremail.generateAuthToken();
        console.log("the token part " + token);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 600000),
            httpOnly: true,
            // secure:true
        })

        if (isMatch) {
            Register.findById({ _id: id })
                .then((data) => {
                    if (!data) {
                        res
                            .status(404)
                            .send({
                                message: `Cannot Update user with ${id}. Maybe user not found!`,
                            });
                    } else {
                        console.log(data);
                        res.render("dashboard", { user: data });
                        
                    }
                })
                .catch((err) => {
                    res.status(500).send({ message: "Error Update user information" });
                });
        } else {
            res.send("invalid credential 1");
        }
    } catch (error) {
        res.status(400).send("invalid credential 2")
    }
})

app.post('/update/:id', (req, res) => {
    console.log(req.params.id);
    console.log(req.body);
    const id = req.params.id;
    Register.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then((data) => {
            if (!data) {
                res
                    .status(404)
                    .send({
                        message: `Cannot Update user with ${id}. Maybe user not found!`,
                    });
            } else {
                console.log(data);
                res.send(`<h1>Thanks for updating data</h1><p><a href="/logout">Go Back to logout</a>`);
            }
        })
        .catch((err) => {
            res.status(500).send({ message: "Error Update user information", err });
        });

})


app.get('**', (req, res) => {
    res.send("page no found")
})

app.listen(port, () => {
    console.log(`server runing ${port}`);
})