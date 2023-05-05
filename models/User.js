const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: [validator.isEmail, "Email is required"],
    },
    

    avatar: { type: String, default: "avatar.png" },
    address:String,
    phoneNumber:String,

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      minLength: 6,
    },

    passwordChangedAt: Date,
    tokenHash: String,
    tokenExpiresIn: Date,

    emailVerify: { type: Boolean, default: false },

    active: { type: Boolean, default: true },

    role: {
      type: String,
      default: "user",
      enum: {
        values: ["user", "admin", "showOwner"],
        message: "Role is required",
      },
      trim: true,
    },
  },
  { timestamps: true, toObject: { virtual: true }, toJSON: { virtual: true } }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ name: 1 }, { unique: true });
UserSchema.index({ email: 1, name: 1 }, { unique: true });

// hash user password before saving to database
UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    user.passwordChangedAt = Date.now() - 1000;

    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// compare password hash with user password
UserSchema.methods.comparePassword = async function (password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

UserSchema.methods.removeUserCredentialfromReq = function () {
  this.password = undefined;
  this.active = undefined;
  // this.confirmPassword = undefined;
};

// handle token send for tpassword
UserSchema.methods.setTokenPropertiesAndgetTokenCode = function () {
  const token = crypto.randomBytes(6).toString("hex");
  this.tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  this.tokenExpiresIn = new Date(Date.now() + 10 * 60 * 1000);

  return token;
};

UserSchema.methods.removeTokenProperties = function () {
  this.tokenHash = undefined;
  this.tokenExpiresIn = undefined;
};

UserSchema.methods.compareToken = function (tokenDB, token) {
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .update(token)
    .digest("hex");
  return tokenHash === tokenDB;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
