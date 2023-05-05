const User = require("../models/User");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const { BadRequestError, UnAuthorizedError } = require("../errors/bad-request");
const Factory= require('./handleFactoryController')

// Signup controller

// Logout controller
// const logout = (req, res) => {
//   res.clearCookie("token");
//   res.status(200).send("Logout successful");
// };

// Profile controller
exports.getMe = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new BadRequestError("User not Found");

  res.status(200).json({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
};

exports.updateMe = async (req, res, next) => {
  const nonAcceptableFields = ["email", "password","role"];

  nonAcceptableFields.forEach((field) => {
    if (req.body[field]) delete req.body[field];
  });

  await User.updateOne({ _id: req.user._id }, { $set: req.body }).exec();
  return send(res, 200, "user updated");
};

exports.setUserIdAsParams = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { password, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword)
    return next(new AppError("Passwords do no match"));

  // is already loginned mean we know who he is through our jwt tokens
  const user = await User.findById(req.user._id).select("password").exec();

  if (!(await user.isValidPassword(password, user.password)))
    return next(new AppError("Password is incorrect", 400));

  // user valid
  user.password = newPassword;
  await user.save();

  next();
});

// CheckLoggedIn controller
// const checkLoggedIn = async (req, res) => {
//   try {
//     const user = await User.findById(req.userId);
//     if (!user) {
//       return res.status(404).send("User not found");
//     }
//     res.status(200).json({
//       name: `${user.firstName} ${user.lastName}`,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal server error");
//   }
// };

exports.getProductTable = async (req, res) => {
  // Get the user ID from the token
  const userId = req.userId;

  // Find the user by ID
  const user = await User.findById(userId);

  // Check if the user is an admin
  if (!user || user.email !== process.env.Admin) {
    return res.status(401).send("Unauthorized access");
  }

  // Send success response
  res.status(200).json({ message: "Authenticated" });
};



// for admin
exports.apiGetUser = Factory.getOne(User);
exports.apiGetUsers = Factory.getAll(User);
exports.apiUpdateUser = Factory.updateOne(User);
exports.apiDeleteUser = Factory.deleteOne(User);
exports.apiCreateUser = Factory.createOne(User);
