//import relevant modules
const express = require ("express");
const cors = require("cors");
const mongoose = require ("mongoose");
//import router from userRoutes.js to process requests
const userRoutes = require("./routes/userRoutes")

//create the express application
const app = express();
require("dotenv").config();

//configure middleware 
//cross origin resource sharing
app.use(cors());
//parsing request bodies with json payloads
app.use(express.json());

//all requests starting with /api/auth will be forwarded to/mapped to one of the handlers in userRoutes
app.use("/api/auth", userRoutes)

//connect to mongo db server.
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("DB Connection Successful");
}).catch((err) => {
    console.log(err.message);
});


const server = app.listen(process.env.PORT,()=>{
    console.log(`Server started on Port ${process.env.PORT}`);
})