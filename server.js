const dotenv = require("dotenv");
const catchAsyncError = require("express-async-errors");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! shutting dow...");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config({ path: "./.env" });

const connectToDB = require("./db/connectMongodb");
connectToDB();

const app = require("./app");

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`node listenenig at port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down");
  console.log(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
