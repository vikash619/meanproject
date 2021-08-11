const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        require: true
    },
    lastname: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    gender: {
        type: String,
        require: true
    },
    phone: {
        type: String,
    },

    age: {
        type: Number,
    },

    password: {
        type: String,
        require: true
    },
    confirmpassword: {
        type: String,
        require: true
    },

    tokens : [{
        token : {
            type:String,
            required: true
        }
    }]
})

//generating token
employeeSchema.methods.generateAuthToken = async function(){
    try{
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET);
        console.log(token);
        this.tokens = this.tokens.concat({token:token});
        return token;
    }catch(error){
        res.send(error);
    }
}

//hasshing
employeeSchema.pre("save", async function (next) {

    if (this.isModified("password")) {
        
        this.password = await bcrypt.hash(this.password, 10)
        console.log("now encrypt "+this.password);
    }

    next();
})


const Register = new mongoose.model("Register", employeeSchema);
module.exports = Register;