//import register function from usersController.js
const { getAllMessage, addMessage, delChat } = require ("../controllers/messagesController");
//instance of Express Router created
const router = require ("express").Router();

//addMessage will be executed when a POST request is made to /addmsg
router.post("/addmsg", addMessage);
router.post("/getmsg", getAllMessage);
router.post("/delchat", delChat);
module.exports = router;