const User = require("../../models/User");
const AppError = require("../../utils/AppError");
const send = require("../../utils/sendJSON");
const { default: mongoose } = require("mongoose");
const catchAsync = require("../../utils/catchAsync");

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError("field missing", 400));

  const user = await User.findOne({ email }, { password: 1 }).exec();
  if (!user) return next(new AppError("user does not exist", 400));

  if (!(await user.comparePassword(password, user.password)))
    return next(new AppError("password not matched", 400));

  req.user = user;
  next();
});

// create-account
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  console.log("name", req.body);

  // check account exist
  const userExist = await Promise.all([
    User.findOne({ name }).exec(),
    User.findOne({ email }).exec(),
  ]);

  const [userWithNameAlreadyExist, userWithEmailAlreadyExist] = userExist;

  if (userWithNameAlreadyExist)
    return next(new AppError("User with name already exists", 400));
  if (userWithEmailAlreadyExist)
    return next(new AppError("User with email already exists", 400));

  req.user = await User.create({ name, email, password });

  console.log(req.user)

  return next();
});

exports.logout = (req, res, next) => {
  res.clearCookie("refreshJwt", { httpOnly: true });
  res.clearCookie("jwt", { httpOnly: true });

  req.user = undefined;
  return send(res, 200);
};

// const signup = async (req, res) => {
//   try {
//     const { firstName, lastName, email, password } = req.body;

//     // check if user with same email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).send("Email already taken");
//     }

//     // create new user and save to database
//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password,
//     });
//     await newUser.save();

//     // send success response
//     res.status(201).json({ message: "User created successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal server error");
//   }
// };

// // Login controller
// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).send("Invalid email or password");
//     }

//     // check if password is correct
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).send("Invalid email or password");
//     }

//     const secretkey = process.env.SECRET_KEY;

//     // generate JWT token
//     const token = jwt.sign({ userId: user._id }, secretkey, {
//       expiresIn: "1day",
//     });

//     // set token as cookie and send success response
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "strict",
//       maxAge: 86400000, // 1 day in milliseconds
//     });

//     res.status(200).json({ message: "Login successful" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal server error");
//   }
// };
