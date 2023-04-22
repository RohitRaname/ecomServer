const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticate = async (req, res, next) => {
  try {
    // get token from cookie
    const token = req.cookies.token;

    // if no token found, user is not authenticated
    if (!token) {
      return res.status(401).send("Unauthorized");
    }
    const secretkey =
      "mynameisnexoandiamgonnachangetheworldbeyondhumanityadavancecivilisationgotitweareheretopushthehumanrace";
    // verify the token and extract user id
    const decoded = jwt.verify(token, secretkey);
    const userId = decoded.userId;

    // check if user exists
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    // attach user id to request object and move to next middleware
    req.userId = userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

module.exports = authenticate;
