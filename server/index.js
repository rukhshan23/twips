//import relevant modules
const express = require ("express");
const cors = require("cors");
const mongoose = require ("mongoose");
//import router from userRoutes.js to process requests
const userRoutes = require("./routes/userRoutes")
const messageRoute = require("./routes/messagesRoutes")

//create the express application
const app = express();
const socket = require("socket.io");
require("dotenv").config();

//configure middleware 
//cross origin resource sharing
app.use(cors());
//parsing request bodies with json payloads
app.use(express.json());

//all requests starting with /api/auth will be forwarded to/mapped to one of the handlers in userRoutes
app.use("/api/auth", userRoutes)
app.use("/api/messages", messageRoute)

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

// const io = socket(server,{
//     cors: {
//         origin: "http::/localhost:3000",
//         credentials: true,
//     }
// })

// global.onlineUsers = new Map();

// io.on("connection",(socket)=>{
//     global.chatSocket = socket;
//     socket.on("add-user", (userId) =>{
//         onlineUsers.set(userId, socket.id);
//     });

//     socket .on("sen-msg", (data)=>{
//         const sendUserSocket = onlineUsers.get(data.to);
//         if(sendUserSocket)
//         {
//             socket.to(sendUserSocket).emit("msg-recieved", data.msg)
//         }
//     })
// })