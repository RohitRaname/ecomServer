const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    s_id: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    //   dress books electronics
    category: String,

    price: {
      type: mongoose.Types.Decimal128,
      required: [true, "price is required"],
    },

    discount: Number,

    // deleted prop
    active: { type: Boolean, default: true },

    qty: {
      type: Number,
      required: [true, "quantity is required"],
    },

    color: String,
    size: String,
    brand: String,

    sizes: [{ variantId: String, size: String }],
    // variants => id means variants id
    colors: [{ variantId: mongoose.Types.ObjectId, color: String }],

    // images: [
    //   {
    //     // this one is medium
    //     filename: String,
    //     height: Number,
    //     url: String,

    //     thumbnails: [
    //       {
    //         full: {
    //           height: 3000,
    //           url: String,
    //         },
    //         large: {
    //           height: 3000,
    //           url: String,
    //         },
    //         small: {
    //           height: 3000,
    //           url: String,
    //         },
    //       },
    //     ],
    //   },
    // ],

    images: [String],

    rating: { type: Number, default: 0 },

    count: {
      ques: { type: Number, default: 0 },
      reviews: { type: Number, default: 0 },
    },

    active: { type: Boolean, default: true },
  },
  {
    timeStamps: true,
  }
);

ProductSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

module.exports = mongoose.model("products", ProductSchema);
