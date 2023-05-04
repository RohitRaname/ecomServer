const mongoose = require("mongoose");

const dressSchema = new mongoose.Schema({
  s_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: [true, "name is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: mongoose.Types.Decimal128,
    required: [true, "price is required"],
  },
  quantity: {
    type: Number,
    required: [true, "quantity is required"],
  },

  images: [
    {
      // this one is medium
      filename: String,
      height: Number,
      url: String,

      thumbnails: [
        {
          full: {
            height: 3000,
            url: String,
          },
          large: {
            height: 3000,
            url: String,
          },
          small: {
            height: 3000,
            url: String,
          },
        },
      ],
    },
  ],

  // imagePath: {
  //   type: String,
  //   required: true,
  // },
});



module.exports = mongoose.model("Dress", dressSchema);
