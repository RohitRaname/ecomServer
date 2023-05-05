const Shop = require("../models/Shop");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

const saveShop = catchAsync(async (req, res) => {
  const { name, email, phone, address, description, profileImage } = req.body;

  const newShop = new Shop({
    name,
    email,
    phone,
    address,
    description,
    profileImage,
  });

  await newShop.save();

  send(res, 201, "shop created");
});

const getShops = async (req, res) => {
  const { query } = req;
  const result = new ApiFeatures(Shop.find({}), query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const docs = await result.query;

  send(res, 201, "shops", docs);
};

module.exports = {
  saveShop,
  getShops,
};
