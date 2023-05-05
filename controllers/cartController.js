//  start this

// user activity cart controller not real cart
// these item can be checkout or not
// when checkout is done we remove these items from use activity
const catchAsync = require("../utils/catchAsync");
const send = require("../utils/sendJSON");
const User = require("../models/User");

const Cart = require("../models/Cart");

const tryCatch = require("../utils/tryCatch");
const topLevelBucketController = require("../controllers/bucketController");

exports.getCartSummary = tryCatch(async (userId) => {
  const items = await topLevelBucketController.getEmbeddedItems(Cart, userId, {
    listName: "items",
    sort: null,
    project: null,
    directContainItems: true,
  });
  console.log("items-count", items);
  const summary = items.reduce(
    (acc, item) => {
      acc.totalQty += item.qty;
      acc.totalPrice += item.price * item.qty;
    },
    { totalQty: 0, totalPrice: 0 }
  );
  return summary;
});

// // update cartItems qty in user obj
// exports.updateUserTotalCartItemsCount = tryCatch(async (userId) => {
//   const totalQty = await this.getCartItemsTotalCount(userId);

//   await User.findOneAndUpdate(
//     { _id: userId },
//     {
//       $set: { "count.cartItems": totalQty },
//     }
//   );
// });

exports.addItemToCart = catchAsync(async (req, res, next) => {
  const item = req.body;
  console.log("add-cart", item);

  await topLevelBucketController.addItemToList(
    Cart,
    req.user._id,
    "items",
    item,
    {
      checkItemExist: true,
      updateIfItemExist: {
        $inc: { "cart.$.qty": item.qty || 1 },
      },
      deleteItemExist: false,
    },
    {
      update: false,
      query: {
        filter: {},

        update: {
          $inc: { "count.cartItems": Number(item.qty) || 1 },
        },
      },
    }
  );

  return send(res, 200, "add item to cart");
});

exports.removeItemFromCart = catchAsync(async (req, res, next) => {
  const itemId = req.params.id;

  console.log("remove-cart-saved-item", req.params);

  await topLevelBucketController.removeItemFromList(
    Cart,
    req.user._id,
    "items",
    itemId, // {_id:item._id}
    {
      update: false,
    }
  );

  return send(res, 200, "item remove from cart");
});

exports.removeGivenItemsFromCart = tryCatch(async (userId, itemIds) => {
  await topLevelBucketController.removeGivenItems(
    Cart,
    userId,
    "cart",
    itemIds
  );

  await this.updateUserTotalCartItemsCount(userId);
});

exports.updateItemQtyInCart = catchAsync(async (req, res, next) => {
  const itemId = req.params.id;
  const { qty } = req.body;

  await topLevelBucketController.updateItemInList(
    Cart,
    req.user._id,
    "items",
    itemId,
    { $set: { "cart.$.qty": qty } }
  );
  await this.updateUserTotalCartItemsCount(req.user._id);
  return send(res, 200, "item qty updated");
});

// what if price changes so we need to get fresh price value

exports.getCartSummary = catchAsync(async (req, res, next) => {
  // amount is in dollar
  const agg = await Cart.aggregate([
    {
      $match: { cart: { $gt: [] } },
    },

    {
      $unwind: "$items",
    },

    { $replaceWith: "$items" },

    // { $sort: { createdAt: -1 } },1

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        pipeline: [
          {
            $project: { price: 1 },
          },
        ],
        as: "match",
      },
    },

    { $set: { match: { $first: "$match" } } },

    {
      $group: {
        _id: null,
        count: { $sum: "$qty" },
        amount: { $sum: { $multiply: ["$qty", "$match.price"] } },
      },
    },

    { $unset: ["_id"] },
  ]);

  const summary = agg[0];

  return send(res, 200, "cart summary", summary);
});

exports.removeAllCartItems = tryCatch(async (req, res) => {
  const userId = req.user._id;
  await topLevelBucketController.removeAllItems(Cart, userId, "cart", {});
  return send(res, 200, "all cart items");
});

// ref
exports.getCartItems = tryCatch(async (req, res) => {
  const userId = req.user._id;
  let items = await topLevelBucketController.getRefItems(Cart, userId, {
    listName: "items",
    // sort: "-ts",
    project: null,
    directContainItems: true,
    lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "item",
      pipeline: [
        {
          $project: {
            price: 1,
          },
        },
      ],
    },
    replaceWith: { $mergeObjects: ["$$ROOT", { $first: "$item" }] },
    unset: "item",
  });

  // format cart-item product
  // items = items.map((item) => formatProduct(item, currency));

  return send(res, 200, "cart items", items);
});
