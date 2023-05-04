const { StatusCodes } = require("http-status-codes");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");
const { sendMail } = require("../../utils/email");
const send = require("../../utils/sendJSON");

const {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} = require("../../errors");
const sendEmail = require("../../utils/email");
const AppError = require("../../utils/AppError");


// module.exports = {
//   forgotPassword,
//   resetPassword,
// };
