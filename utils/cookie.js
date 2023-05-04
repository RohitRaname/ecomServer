const refreshCookieOptions = {
  // 80days
  expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES_IN)),
  httpOnly: true, // Not alter by anyone or even delete()
};
const jwtCookieOptions = {
  // 7min
  expires: new Date(Date.now() + Number(process.env.JWT_EXPIRES_IN)),
  httpOnly: true, // Not alter by anyone or even delete()
};

// we use cookie because cookie are safe to use (they can be altered or accessed not even by us we can just send one to replace to old one )

// cookie are safe to use

// when we send cookie then our one req of user is waste so we need to reload the page
function cookiesOptions() {
  return { refreshCookieOptions, jwtCookieOptions };
}


module.exports = { cookiesOptions };
