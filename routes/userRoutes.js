const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.get("/", usersController.getAllUsers);

router.post("/", usersController.createNewUser);

router.patch("/", usersController.updateUser);

router.delete("/", usersController.deleteUser);

module.exports = router;
