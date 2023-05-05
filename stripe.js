const catchAsync = require("./utils/catchAsync");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Product = require("./models/Product");

const stripeCheckout = catchAsync(async (req, res) => {
  // _id,quantity
  let { products } = req.body;

  products = await Product.find({ _id: { $in: products.map((el) => el._id) } });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],

    line_items: products.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product.name,
        },
        unit_amount: product.price * 100,
      },
      quantity: product.quantity,
    })),

    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/success`,
    cancel_url: `${req.protocol}://${req.get("host")}/success`,
  });
  res.json({ id: session.id });
});

module.exports = stripeCheckout;
