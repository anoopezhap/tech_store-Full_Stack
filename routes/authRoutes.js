const express = require("express");
const router = express.Router();
const loginLimiter = require("./../middleware/loginLimiter");
const { default: rateLimit } = require("express-rate-limit");
const authController = require("../controllers/authController");

router.post("/", loginLimiter, authController.login);

router.get("/refresh", authController.refresh);

router.post("/logout", authController.logout);

module.exports = router;
