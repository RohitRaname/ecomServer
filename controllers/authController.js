/* eslint-disable camelcase */
const User = require("../models/User");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const send = require("../utils/sendJSON");
const sendEmail = require("../utils/email");
const { generateHash } = require("../utils/crypto");

const passImfToNext = (req, user, statusCode, message) => {
  req.pass = true;
  req.user = user;
  req.statusCode = statusCode;
  req.message = message;
};

exports.sendEmailFunc = async (req, user, email_type, email_route) => {
  try {
    let verificationToken = "";

    verificationToken = user.setTokenPropertiesAndgetTokenCode();
    await user.save();

    await sendEmail(
      req,
      user,
      email_type,
      `${email_route}/${verificationToken}`,
      verificationToken
    );
  } catch (err) {
    console.log(err);
    // if error comes during sending of email
    // remove user token set propeties as there are no longer userful

    if (!send_token) return false;

    user.removeTokenProperties();

    // then save the user
    await user.save();
  }

  return true;
};

exports.removeVerificationTokenProperties = catchAsync(
  async (req, res, next) => {
    const { user } = req;
    user.removeTokenProperties();
    await user.save();
    return send(res, 200);
  }
);

// verify token from email (like resetpassword or forgotpassword or confirm signup)
exports.verifyToken = async (req, type, token) => {
  console.log("token-hash", token);
  const tokenHash = generateHash(token.trim());

  const user = await User.findOne({
    tokenHash,
    tokenExpiresIn: { $gte: new Date() },
  });

  console.log("user-verofu", user);

  if (!user) return false;

  user.removeTokenProperties();
  if (type === "signup-verification") user.emailVerify = true;

  await user.save();

  req.user = user;
  return user;
};

// initially call then roles wil be defined in parent function as varible inside it and due to closure(access to outer scope even  if function is removed from stack)
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("Permission denied"));

    next();
  };

exports.logout = (req, res, next) => {
  res.clearCookie("refreshJwt", { httpOnly: true });
  res.clearCookie("jwt", { httpOnly: true });

  req.user = undefined;
  return send(res, 200);
};

/////////////////////////////////////////////////////

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  console.log("name", req.body);

  // check account exist
  const userExist = await Promise.all([
    User.findOne({ name, verify: true }).exec(),
    User.findOne({ email, verify: true }).exec(),
  ]);

  const [userWithNameAlreadyExist, userWithEmailAlreadyExist] = userExist;

  if (userWithNameAlreadyExist)
    return next(new AppError("User with name already exists", 400));
  if (userWithEmailAlreadyExist)
    return next(new AppError("User with email already exists", 400));

  const user = await User.create({ name, email, password }); // Email send

  const emailSendSuccessfully = await this.sendEmailFunc(
    req,
    user,
    "signup-verification",
    "/api/v1/auth/confirmSignup"
  );

  if (!emailSendSuccessfully)
    return next(
      new AppError("email not send! Please try to signup again", 500)
    );

  req.user = undefined;

  console.log(req.user);

  return send(res, 200, "confirm signup");
});

// to verify user after email send during signup (change {verify:true})
exports.confirmSignupUser = catchAsync(async (req, res, next) => {
  const userVerify = await this.verifyToken(
    req,
    "signup-verification",
    req.params.token
  );

  if (!userVerify)
    return next(
      new AppError("sign verification failed! Please try again", 400)
    );

  // after token is given
  req.redirectPath = "/";

  return next();
});

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // check if email exists
  const user = await User.findOne({ email }).exec();
  if (!user) return next(new AppError("User does not exist!", 404));

  // save
  await user.save();

  const emailSendSuccessfully = await this.sendEmailFunc(
    req,
    user,
    "reset-password",
    null
  );

  if (!emailSendSuccessfully)
    return next(new AppError("email not send! Please try again", 500));

  // if success show user mesage on screen
  return send(res, 200, "check yout email");

  // if exist so we will send a reset password email
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // if find update password
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword)
    return next(
      new AppError(" password and confirmPassword are required", 400)
    );

  if (password !== confirmPassword)
    return next(
      new AppError("Password And Confirm Password do not match", 400)
    );

  const tokenValid = await this.verifyToken(
    req,
    "reset-password",
    req.params.token
  );

  if (!tokenValid)
    return next(new AppError("reset password failed ! Please try again"));

  const user = tokenValid;

  user.password = password;
  await user.save();

  next();
});

// anything related to passwrod comes in auth
