const User = require("../models/User");
const refreshTokenModel = require("../models/RefreshToken");

const send = require("../utils/sendJSON");
const catchAsync = require("../utils/catchAsync");
const { generateTokens, decodeToken } = require("../utils/jwtToken");
const { cookiesOptions } = require("../utils/cookie");
const tryCatch = require("../utils/tryCatch");

const deleteJwt = async (userID) => {
  await refreshTokenModel.findOneAndDelete({ user: userID }).exec();
};

const createJwt = async (userID, token) => {
  await refreshTokenModel.create({ user: userID, refreshToken: token }).exec();
};

const updateJwt = async (userID, token) => {
  await refreshTokenModel
    .findOneAndUpdate({ user: userID }, { refreshToken: token })
    .exec();
};

const createOrupdateJwt = async (userID, token) => {
  await refreshTokenModel
    .findOneAndUpdate(
      { user: userID },
      { user: userID, refreshToken: token },
      { upsert: true }
    )
    .exec();
};

// /api/v1/token/stolen'
// '/api/v1/token/send'
// '/api/v1/token/check'

const handleStolenJwt = tryCatch(async (req, res) => {
  const jwt = decodeToken(req.cookies.jwt, process.env.JWT_SECRET);
  const { id } = jwt;

  const user = await User.findById(id).exec();
  if (user) {
    await refreshTokenModel.findOneAndDelete({ user: user.id }).exec();
    // user.invalidRefreshTokenTries = Number(user.invalidRefreshTokenTries) + 1;

    // if (user.invalidRefreshTokenTries >= 2) user.blackList = true;
    // await user.save({ validateBeforeSave: false });
  }

  return;
});

const handleUserPasswordChanged = tryCatch(async (res, user, decodedToken) => {
  const passwordChangedAt = +new Date(user.passwordChangedAt);
  const tokenCreationTime = Number(decodedToken.iat) * 1000;

  if (passwordChangedAt > tokenCreationTime) {
    return send(res, 200, "login first");
  }

  return true;
});

const handleUserValid = tryCatch(async (res, jwt, optionalUserID) => {
  let userID, token;

  if (optionalUserID) {
    token = jwt;
    userID = optionalUserID;
  } else {
    token = await decodeToken(jwt, process.env.JWT_SECRET);
    userID = token.id;
  }

  // check if user exist in db
  const user = await User.findOne({
    _id: userID,
    blackList: false,
    invalidRefreshTokenTries: { $lt: 2 },
    emailVerify: true,
  }).exec();

  if (!user) {
    return;
  }
  const passwordChangeAtTimingIsValid = await handleUserPasswordChanged(
    res,
    user,
    token
  );
  if (!passwordChangeAtTimingIsValid) return;

  return user;
});

const blackListUserIfTokenInvalidPassesMaxTries = tryCatch(
  async (res, user, token, refreshJwt) => {
    if (!token || token.refreshToken !== refreshJwt) {
      let invalidTokenTries = +user.invalidRefreshTokenTries;
      invalidTokenTries += 1;

      if (invalidTokenTries >= 2) {
        user.blackListUser = true;
        user.invalidTokenTries = invalidTokenTries;
        user.save({ validateBeforeSave: false }).exec();
        return;
      }
    }

    return true;
  }
);

const handleRefreshJwt = tryCatch(async (res, refreshJwt) => {
  const decodedToken = await decodeToken(
    refreshJwt,
    process.env.REFRESH_JWT_SECRET
  );

  const userID = decodedToken.id;

  const user = await handleUserValid(res, decodeToken, userID);
  if (!user) return;

  const token = await refreshTokenModel.findOne({ user: userID }).exec();

  // const isUserBlacklisted = await blackListUserIfTokenInvalidPassesMaxTries(
  //   res,
  //   user,
  //   token,
  //   refreshJwt
  // );
  // if (!isUserBlacklisted) return;

  //  hacked made cookie
  if (!token) return;

  // resued old cookie
  if (token.refreshToken !== refreshJwt) {
    await deleteJwt(userID);
    return;
  }

  return user;
});

exports.protect = catchAsync(async (req, res, next) => {
  const { jwt, refreshJwt } = req.cookies;

  let user;

  // if no cookie exist mean this is a new user or a old user which has not login from a long time
  // if we have no cookies then login

  // if (!jwt && !refreshJwt) return res.redirect('/auth/signup/create-account');
  if (!jwt && !refreshJwt) return send(res, 200, "login first");

  // if we have only jwt no refresh that means it is stolen
  if (jwt && !refreshJwt) await handleStolenJwt(req, res);

  if (!jwt && refreshJwt) user = await handleRefreshJwt(res, refreshJwt);

  if (jwt && refreshJwt) user = await handleUserValid(res, jwt);

  if (!user) return res.redirect("/logout");

  // reached here mean user is valid(jwt + refresh case)
  req.user = user;
  req.loginUser = true;

  if (jwt && refreshJwt) req.userBothJwtAreValid = true;

  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  const { jwt, refreshJwt } = req.cookies;
  let user;

  // if no cookie exist mean this is a new user or a old user which has not login from a long time
  // if we have no cookies then login

  if (!jwt && !refreshJwt) {
    req.loginUser = false;
    return next();
  }

  // if we have only jwt no refresh that means it is stolen
  if (jwt && !refreshJwt) await handleStolenJwt(req, res);

  if (!jwt && refreshJwt) user = await handleRefreshJwt(res, refreshJwt);

  if (jwt && refreshJwt) user = await handleUserValid(res, jwt);

  // reached here mean user is valid(jwt + refresh case)
  if (!user) return send(res, 200, "login first");

  req.user = user;
  req.loginUser = true;

  if (jwt && refreshJwt) req.userBothJwtAreValid = true;
  next();
});

exports.sendTokens = (pass) =>
  catchAsync(async (req, res, next) => {

    console.log('sendTokens')
    
    if ((req.user && req.userBothJwtAreValid) || req.loginUser === false) {
      return pass ? next() : send(res, 200);
    }
    console.log('sendTokens sending')
    //   return next();
    const { _id } = req.user;

    // create token
    const { jwtToken, refreshJwtToken } = generateTokens(_id);

    //   let save the new refresh token
    await createOrupdateJwt(_id, refreshJwtToken);

    // create cookie
    const { refreshCookieOptions, jwtCookieOptions } = cookiesOptions();
    res.cookie("refreshJwt", refreshJwtToken, refreshCookieOptions);
    res.cookie("jwt", jwtToken, jwtCookieOptions);

    // resetting some properties
    //   req.userBothJwtAreValid = false;
    if (pass) return next();
    return send(res, 200);

    // Now need to clear some variables for future safe req here properties dont repeat
  });

exports.isLoggedInFunc = (pass) => [
  this.isLoggedIn,
  this.sendJwtIfNeeded(pass),
];
exports.protectFunc = (pass) => [this.protect, this.sendJwtIfNeeded(pass)];

// exports.sendJwt = catchAsync(async (req, res) => {
//   const { _id } = req.user;

//   // create token
//   const { jwtToken, refreshJwtToken } = generateTokens(_id);

//   //   let save the new refresh token
//   await createOrupdateJwt(_id, refreshJwtToken);

//   // create cookie
//   const { refreshCookieOptions, jwtCookieOptions } = cookiesOptions();
//   res.cookie('refreshJwt', refreshJwtToken, refreshCookieOptions);
//   res.cookie('jwt', jwtToken, jwtCookieOptions);

//   // To send response to server
//   //   req.user = undefined;

//   return sendReq(res, req.statusCode || 200, req.message);
// });
