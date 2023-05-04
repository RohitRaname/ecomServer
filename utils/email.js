/* eslint-disable camelcase */
"use strict";

const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
const AppError = require("./AppError");

class Email {
  constructor(user, url, verify_code) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.verify_code = verify_code;
    this.from = `Rohit<${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    // Sendgrid
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // your Gmail email address
        pass: process.env.GMAIL_PASSWORD, // your Gmail password or app-specific password
      },
    });
    // }

    // return nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../../emailPug/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }

  async sendSignUpVerification() {
    await this.send("signUpVerification", "Sign Up(valid for only 10 minutes)");
  }
}

let retrySendEmailCount = 0;
// max will be => 2
async function sendEmail(req, user, type, path, token) {
  const url = `${req.protocol}://${req.get(
    "host"
  )}/${path}?token=${token}`;
  const email = new Email(user, url, token);

  try {
    if (type === "signup-verification") await email.sendSignUpVerification();
    if (type === "reset-password") await email.sendPasswordReset();
    if (type === "signup-success") await email.sendWelcome();
  } catch (err) {
    console.log(err);
    retrySendEmailCount += 1;
    console.log("error-during-send-email");
    if (retrySendEmailCount === 2)
      return new AppError("Please try to signUp again!", 500);

    await sendEmail(req, user, type, path, token);
  }
}

module.exports = sendEmail;
// sendEmail().catch((err) => console.log(err));
