const db = require("../models");
const Product = db.product;
const SavedProduct = db.savedProduct;
const User = db.user;

responsePayload = (status, message, payload) => ({
  status,
  message,
  payload,
});

exports.create = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.userId } });
    const product = await Product.findOne({
      where: { code: req.body.productCode, status: "active" },
    });
    const savedProduct = await SavedProduct.create();
    await savedProduct.setUser(user);
    await savedProduct.setProduct(product);
    res.json(responsePayload(true, "Lưu sản phẩm thành công!", product));
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.remove = async (req, res) => {
  try {
    if (!req.params.id)
      return res
        .status(400)
        .json(responsePayload(false, "Đường dẫn thiêú id!", null));
    const bookmark = await SavedProduct.findOne({
      where: {
        id: req.params.id,
      },
    });
    await bookmark.destroy({ force: true });
    res.json(responsePayload(true, "Xoá Bookmark thành công!", null));
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};
