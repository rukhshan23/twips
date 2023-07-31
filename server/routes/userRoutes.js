//import register function from usersController.js
const {register} = require ("../controllers/usersController");

//instance of Express Router created
const router = require ("express").Router();

//register will be executed when a POST request is made to /registerß
router.post("/register", register);
module.exports = router;