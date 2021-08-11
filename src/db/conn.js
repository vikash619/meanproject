const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/youtubeRegistration", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(()=>{
    console.log("connect successful");
}).catch((err)=>{
    console.log(err);
})