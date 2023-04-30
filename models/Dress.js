const mongoose = require("mongoose");

const dressSchema = new mongoose.Schema({
  s_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Dress", dressSchema);
