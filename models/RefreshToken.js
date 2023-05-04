const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    toObject: { virtual: true },
    toJSON: { virtual: true },
    timestamps: true,
  }
);

refreshTokenSchema.index({ user: 1, refreshToken: -1 }, { unique: true });

const refreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = refreshTokenModel;
