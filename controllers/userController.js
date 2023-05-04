const User = require("../models/User");
const jwt = require("jsonwebtoken");

const { BadRequestError, UnAuthorizedError } = require("../errors/bad-request");

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
  const nonAcceptableFields = ["email", "password"];

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
