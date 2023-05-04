const crypto = require('crypto');

function compareHash(tokenDB, token) {
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .update(token)
    .digest('hex');
  return tokenHash === tokenDB;
}

function generateHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setVerificationToken(user) {
  const token = crypto.randomBytes(6).toString('hex');
  user.tokenHash = crypto.createHash('sha256').update(`${token}`).digest('hex');
  user.tokenExpiresIn = Date.now() + 60 * 10 * 1000;
  return token;
}

module.exports = { setVerificationToken, generateHash,compareHash };
