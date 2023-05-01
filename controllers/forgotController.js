const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // check if user with the email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const secretkey = process.env.SECRET_KEY;

    // generate JWT token with email and user ID as payload
    const token = jwt.sign({ email, userId: user._id }, secretkey, {
      expiresIn: "15m", // token expires in 15 minutes
    });

    // send email with link to reset password
    const resetPasswordLink = `http://localhost:3000/reset-password/${token}`;

    // create a nodemailer transporter with Gmail SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // your Gmail email address
        pass: process.env.GMAIL_PASSWORD, // your Gmail password or app-specific password
      },
    });

    const subject = "Reset Your Password";
    const html = `
      <p>Hello,</p>
      <p>Please click the following link to reset your password:</p>
      <a href="${resetPasswordLink}">${resetPasswordLink}</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;

    // send email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject,
      html,
    });

    // send success response
    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const token = req.params.token;

    // verify JWT token
    const secretkey = process.env.SECRET_KEY;
    jwt.verify(token, secretkey, async (err, decoded) => {
      if (err) {
        return res.status(401).send("Invalid token");
      }

      // check if email in token matches email in request body
      if (decoded.email !== email) {
        return res.status(401).send("Invalid email");
      }

      // hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // update user's password
      const user = await User.findOneAndUpdate(
        { email },
        { password: hashedPassword }
      );

      if (!user) {
        return res.status(404).send("User not found");
      }

      // send success response
      res.status(200).json({ message: "Password updated successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  forgotPassword,
  resetPassword,
};
