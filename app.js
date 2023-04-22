const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// import models and middleware
const User = require("./models/user");
const authenticate = require("./middleware/authenticate");
require("dotenv").config();

const url =
  "mongodb+srv://Nexo:9456@cluster0.osasaot.mongodb.net/Nexo?retryWrites=true&w=majority";
const app = express();

// Connect to MongoDB database
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Define schema for order data
const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  cartItems: {
    type: Array,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  checked: {
    type: Boolean,
    default: false,
  },
});

// Create Order model from schema
const Order = mongoose.model("Order", orderSchema);

// Parse request body as JSON
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Use cookie-parser middleware

// Handle POST request to /api/orders
app.post("/api/orders", authenticate, async (req, res) => {
  const { name, email, address, cartItems, totalCost } = req.body;

  // Create new Order instance with request data
  const newOrder = new Order({
    name,
    email,
    address,
    cartItems,
    date: new Date(),
  });

  try {
    // Save new order to database
    await newOrder.save();
    // Send response indicating success
    res.status(201).json({ message: "Order submitted successfully" });
  } catch (err) {
    console.error(err);
    // Send response indicating error
    res.status(500).json({ message: "Server error" });
  }
});
// Handle GET request to /api/orders
app.get("/api/orders", async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find();
    // Send response with orders
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    // Send response indicating error
    res.status(500).json({ message: "Server error" });
  }
});

// Handle DELETE request to /api/orders/:orderId
app.delete("/api/orders/:orderId", async (req, res) => {
  try {
    // Get the order ID from the request params
    const orderId = req.params.orderId;
    // Delete the order from the database
    const result = await Order.deleteOne({ _id: orderId });
    // Send response indicating success
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    // Send response indicating error
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get data
app.get("/api/producttable", authenticate, async (req, res) => {
  const user = await User.findById(req.userId);
  try {
    if (!user || user.email !== "nexo91@gmail.com") {
      return res.status(401).send("Unauthorized access");
    }

    res.status(200).json({ message: "authenticated " });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//authenitacation
// import necessary modules

const jwt = require("jsonwebtoken");

// import models and middleware

// set up middleware
app.use(express.json());

// set up routes
app.post("/api/signup", async (req, res) => {
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
});

app.post("/api/login", async (req, res) => {
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

    const secretkey =
      "mynameisnexoandiamgonnachangetheworldbeyondhumanityadavancecivilisationgotitweareheretopushthehumanrace";

    // generate JWT token
    const token = jwt.sign({ userId: user._id }, secretkey, {
      expiresIn: "1day",
    });

    // set token as cookie and send success response
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 86400000, // 1 day
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

app.get("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).send("Logout successful");
});

app.get("/api/profile", authenticate, async (req, res) => {
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
});

app.get("/api/checkLoggedIn", authenticate, (req, res) => {
  const userId = req.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send("User not found");
      }
      res.status(200).json({
        name: `${user.firstName} ${user.lastName}`,
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal server error");
    });
});

//register shops code
// Middleware to check user email
const Shop = require("./models/Shop");

// Route to save data
app.post("/api/saveData", async (req, res) => {
  const { s_id, name, email, phone, address } = req.body;

  try {
    const newShop = new Shop({
      s_id,
      name,
      email,
      phone,
      address,
    });

    await newShop.save();
    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get data
app.get("/api/getData", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.email !== "nexo91@gmail.com") {
      return res.status(401).send("Unauthorized access");
    }
    const shops = await Shop.find();
    res.status(200).json(shops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//store the checked mark
app.patch("/api/orders/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.email !== "nexo91@gmail.com") {
      return res.status(401).send("Unauthorized access");
    }
    const orderId = req.params.id;
    const checked = req.body.checked;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.checked = checked;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
