/* eslint-disable camelcase */
const User = require("../../Model/user/userModel");

const AppError = require("../../utils/AppError");
const send = require("../../utils/sendJSON");
const sendEmail = require("../../utils/email");
const { generateHash } = require("../../utils/crypto");
const catchAsync = require("../../utils/catchAsync");
const tryCatch = require("../../utils/tryCatch");

exports.restricTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("Permission denied"));

    next();
  };



// need token
exports.verifyOTPToken = (pass) =>
  catchAsync(async (req, res, next) => {
    const { email, token } = req.body;
    const tokenHash = generateHash(token);

    const user = await User.findOne({
      email,
      tokenHash,
    }).exec();

    if (!user)
      return next(
        new AppError(
          { title: "Invalid Token", text: "Please enter valid token" },
          400
        )
      );
    if (user && new Date() > new Date(user.tokenExpiresIn))
      return next(
        new AppError(
          { title: "Token Expired", text: "Reapply for new Token" },
          400
        )
      );
    user.removeTokenProperties();
    await user.save();

    req.user = user;

    if (pass) return next();
    return send(res, 200);
  });

// need req.user
exports.sendOTPToken = (email_type, redirect_link_path) => async (req, res) => {
  const { user } = req;

  try {
    let verificationToken = "";

    verificationToken = req.user.setTokenPropertiesAndGetTokenCode();

    await user.save();
    await sendEmail(
      req,
      user,
      email_type,
      `${redirect_link_path}/${verificationToken}`,
      verificationToken
    );
  } catch (err) {
    console.log(err);
    // if error comes during sending of email
    // remove user token set propeties as there are no longer userful

    user.removeTokenProperties();

    // then save the user
    await user.save();
    return send(res, err.statusCode, err.status, err.message);
  }

  return send(res, 200, "Check verification code at mailtrap");
};

// send token to user email (need user email)
exports.setUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    email: req.params.email || req.body.email,
  }).exec();
  if (!user)
    return next(
      new AppError(
        {
          title: "Email not exist",
          text: "Account with email not exist",
        },
        400
      )
    );
  req.user = user;
  next();
});

// ADMIN ==================================================
