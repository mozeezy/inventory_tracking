const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserInfo,
  checkLoginStatus,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/userControllers");
const authorize = require("../middleware/authorize");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getuser", authorize, getUserInfo);
router.get("/loginstatus", checkLoginStatus);
router.patch("/changepassword", authorize, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;
