const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./db/db");

// Load environment variables from .env file
require("dotenv").config();

const app = express();

// Connect to MongoDB database
connectDB();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static("public"));

// Routers
const orderRouter = require("./routes/orderRoute");
const userRouter = require("./routes/userRouter");
const shopRouter = require("./routes/shopRouter");
const forgotRouter = require("./routes/forgotRouter");

// Routes
app.use("/api/orders", orderRouter);
app.use("/api", userRouter);
app.use("/", shopRouter);
app.use("/api", forgotRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
