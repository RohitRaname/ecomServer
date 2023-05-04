const Shop = require("../models/Shop");
const User = require("../models/User");
const saveShop = async (req, res) => {
  const { s_id, name, email, phone, address } = req.body;

  try {
    const newShop = new Shop({
      s_id,
      name,
      email,
      phone,
      address,
    });

    await newShop.save();
    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getShops = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.email !== "nexo91@gmail.com") {
      return res.status(401).send("Unauthorized access");
    }
    const shops = await Shop.find();
    res.status(200).json(shops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  saveShop,
  getShops,
};
