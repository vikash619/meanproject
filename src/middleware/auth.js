const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async (req,res,next) =>{
    try{
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token, process.env.SECRET);
        console.log(verifyUser);
        // next();
    }catch(error){
        res.status(401).send(error);
    }
}

module.exports = auth;