const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const JsonWebToken = require("jsonwebtoken");

const generateToken = (id) => {
  return JsonWebToken.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
};

// Register User Controller Function
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate that the user has not left any fields empty.
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in the missing fields");
  }

  // Validate that the password length is at least 8 characters long
  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must contain 8 characters");
  }

  // Find user in mongoDB database by email.
  const userInDatabase = await User.findOne({ email });

  // If the user exists in the database, throw an error
  if (userInDatabase) {
    res.status(400);
    throw new Error(
      "A user with that email already exists. Please use a different email address"
    );
  }

  // Hashing the password BEFORE storing it in the Database.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user using the User model we created and the data we get from the req.body object.
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Generate JWT

  const token = generateToken(newUser._id);

  // Send a cookie with the token to the frontend
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });

  // If the user exists then respond with the JSON format confirming that the user has been created. This data is sent to the frontend
  if (newUser) {
    res.status(201).json({
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid request.");
  }
});

// Login User Function

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate that the email/password fields are filled

  if (!email || !password) {
    res.status(400);
    throw new Error("Please fill in the missing fields");
  }

  // Check if the user exists in the database

  const isUserInDatabase = await User.findOne({ email });

  if (!isUserInDatabase) {
    res.status(400);
    throw new Error("This user does not exist. Please sign up");
  }

  // Check that the email entered matches the password for that user

  const checkPassword = await bcrypt.compare(
    password,
    isUserInDatabase.password
  );

  const token = generateToken(isUserInDatabase._id);

  // Send a cookie with the token to the frontend
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    sameSite: "none",
    secure: true,
  });

  if (isUserInDatabase && checkPassword) {
    res.status(200).json({
      _id: isUserInDatabase.id,
      name: isUserInDatabase.name,
      email: isUserInDatabase.email,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email/password");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  return res.status(200).clearCookie().json({ message: "Logout Successful" });
});

module.exports = { registerUser, loginUser, logoutUser };