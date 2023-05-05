const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");

// Routers
const orderRouter = require("./routes/orderRouter");
const userRouter = require("./routes/userRouter");
const shopRouter = require("./routes/shopRouter");
const authRouter = require("./routes/authRouter");
const productRouter= require('./routes/productRouter')
const cartRouter= require('./routes/cartRouter')

const GlobalErrorHandler= require('./controllers/globalErrorHandler')

// utils
const send= require('./utils/sendJSON')

// Load environment variables from .env file

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static("public"));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/shops", shopRouter);
app.use('/api/v1/products',productRouter)
app.use('/api/v1/carts',cartRouter)

app.use("/api*", (req, res) => send(res, 404, "api not found"));

app.use("*", (req, res, next) => {
  console.error(`Route doesn't exist ${req.originalUrl}`);
  next();
});


app.use(GlobalErrorHandler);

module.exports = app;
