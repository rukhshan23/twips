//import register function from usersController.js
const {register} = require ("../controllers/usersController");
const {login} = require ("../controllers/usersController");
const {setAvatar} = require ("../controllers/usersController");
const {getAllUsers} = require ("../controllers/usersController");

//instance of Express Router created
const router = require ("express").Router();

//register will be executed when a POST request is made to /registerß
router.post("/register", register);
router.post("/login", login);
router.post("/setAvatar/:id", setAvatar);
router.get("/allUsers/:id", getAllUsers);
module.exports = router;