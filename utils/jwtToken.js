/* eslint-disable camelcase */
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("./catchAsync");
const send = require("./sendJSON");

function createJwtToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function createRefreshJwtToken(id) {
  return jwt.sign({ id }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: process.env.REFRESH_JWT_EXPIRES_IN,
  });
}

// i will never do that again  in my life again ever i swear on me me me

function generateTokens(id) {
  // variables are redefined inside function scope
  const jwtToken = createJwtToken(id);
  const refreshJwtToken = createRefreshJwtToken(id);

  return { jwtToken, refreshJwtToken };
}

async function decodeToken(token, secret) {
  let verify = promisify(jwt.verify);
  const decodedToken = await verify(token, secret);
  return decodedToken;
}
exports.remove_token_prop_fields_from_user = catchAsync(
  async (req, res, next) => {
    const { user } = req;
    user.removeTokenProperties();
    await user.save();
    return send(res, 200);
  }
);

// exports.verify_token = (type, successMsg = null, errorMsg = 'try') =>
//   catchAsync(async (req, res, next) => {
//     const { token } = req.body;
//     const tokenHash = generateHash(token);

//     const user = await User.findOne({
//       tokenHash,
//       tokenExpiresIn: { $gte: new Date() },
//     });

//     if (!user)
//       return next(
//         new AppError(
//           `Verification time is over!. Please ${errorMsg} again`,
//           400
//         )
//       );

//     if (type === 'signUp') user.verify = true;
//     user.removeTokenProperties();
//     await user.save();

//     return send(res, 200, successMsg);
//   });

// in cookie we send jwt
module.exports = { generateTokens, decodeToken };
