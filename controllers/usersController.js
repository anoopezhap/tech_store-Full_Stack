const User = require("../models/User");
const Note = require("../models/Note");
//package to avoid too much try catch blocks
const asyncHandler = require("express-async-handler");
const brcypt = require("bcrypt");

//@desc Get all users
//@route Get /users
//@access Private

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

//@desc Create new user
//@route POST /users
//@access Private

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  //console.log(req.body);

  //confirm data
  if (!username || !password || !Array.isArray(roles) || !roles?.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check for duplicates
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  //Hashpassword
  const hashedPwd = await brcypt.hash(password, 10);

  const userObject = { username, password: hashedPwd, roles };

  //create and store new user
  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});

//@desc Update a user
//@route PATCH /users
//@access Private

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  //confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "No user found" });
  }

  //check is updated username already exists
  const duplicate = await User.findOne({ username }).lean().exec();
  //allow updates to original user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  //updating the user
  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    //hashing password
    const hashedPwd = await brcypt.hash(password, 10);
    user.password = hashedPwd;
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

//@desc Delete a user
//@route DELETE /users
//@access Private

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ message: "User ID required" });
  }

  //if a note exists for a user. We don't want to delete the user

  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) {
    return res.status(400).json({ message: "User has assgined notes" });
  }

  //does the user exist to delete
  const user = await User.findById(id).exec();

  //console.log(user);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  //console.log(result);

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
