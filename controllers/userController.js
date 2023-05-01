const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Signup controller
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // check if user with same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send("Email already taken");
    }

    // create new user and save to database
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
    });
    await newUser.save();

    // send success response
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("Invalid email or password");
    }

    // check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send("Invalid email or password");
    }

    const secretkey = process.env.SECRET_KEY;

    // generate JWT token
    const token = jwt.sign({ userId: user._id }, secretkey, {
      expiresIn: "1day",
    });

    // set token as cookie and send success response
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 86400000, // 1 day in milliseconds
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

// Logout controller
const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).send("Logout successful");
};

// Profile controller
const profile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

// CheckLoggedIn controller
const checkLoggedIn = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json({
      name: `${user.firstName} ${user.lastName}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const getProductTable = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  profile,
  checkLoggedIn,
  getProductTable,
};
