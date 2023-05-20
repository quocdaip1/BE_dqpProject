const db = require("../models");
const Product = db.product;

responsePayload = (status, message, payload) => ({
  status,
  message,
  payload,
});

validator = (req, res, next) => {
  if (!req.body.name)
    return res
      .status(400)
      .send(responsePayload(false, "Vui lòng nhập tên sản phẩm!", null));
  if (!req.body.quantity)
    return res
      .status(400)
      .json(responsePayload(false, "Vui lòng nhập số lượng sản phẩm!", null));
  if (!req.body.price)
    return res
      .status(400)
      .json(responsePayload(false, "Vui lòng nhập giá sản phẩm!", null));
  if (!req.body.image)
    return res
      .status(400)
      .json(
        responsePayload(false, "Vui lòng cung cấp hình ảnh sản phẩm!", null)
      );
  if (!req.body.categoryCode)
    return res
      .status(400)
      .json(responsePayload(false, "Vui lòng cung cấp loại sản phẩm!", null));
  if (!req.body.subCategoryCode)
    return res
      .status(400)
      .json(
        responsePayload(false, "Vui lòng cung cấp loại sản phẩm phụ!", null)
      );
  next();
};

const verifyProduct = {
  validator,
};

module.exports = verifyProduct;
