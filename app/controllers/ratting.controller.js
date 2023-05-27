const db = require("../models");
const Product = db.product;
const Ratting = db.ratting;
const User = db.user;
const { Op } = require("sequelize");

responsePayload = (status, message, payload) => ({
  status,
  message,
  payload,
});

exports.create = async (req, res) => {
  try {
    if (!req.body.rating)
      return res
        .status(400)
        .send(responsePayload(false, "Vui lòng chọn đánh giá!", null));
    if (!req.body.comment)
      return res
        .status(400)
        .json(responsePayload(false, "Vui lòng nhập comment!", null));
    if (!req.body.productId)
      return res
        .status(400)
        .json(responsePayload(false, "Vui lòng nhập chọn sản phẩm!", null));
    const product = await Product.findOne({
      where: {
        id: req.body.productId,
      },
      include: Ratting,
    });
    if (!product)
      return res.json(
        responsePayload(false, "sản phẩm không tồn tại!", product)
      );
    await Ratting.create({
      ...req.body,
      userId: req.userId,
    });
    let totalOne = 0;
    let totalTwo = 0;
    let totalThree = 0;
    let totalFour = 0;
    let totalFive = 0;
    let totalRate = 0;
    if (product.rattings.length) {
      for (const rate of product.rattings) {
        if (rate.rating === 1) totalOne += 1;
        if (rate.rating === 2) totalTwo += 1;
        if (rate.rating === 3) totalThree += 1;
        if (rate.rating === 4) totalFour += 1;
        if (rate.rating === 5) totalFive += 1;
        totalRate += 1;
      }
      const advRatting =
        (totalOne * 1 +
          totalTwo * 2 +
          totalThree * 3 +
          totalFour * 4 +
          totalFive * 5) /
        totalRate;
      product.rate = parseFloat(advRatting.toFixed(2));
    } else product.rate = req.body.rating;

    await product.save();
    const savedProduct = await Product.findOne({
      where: {
        id: req.body.productId,
      },
      include: [{ model: Ratting, include: User }],
    });
    res.json(
      responsePayload(true, "Đánh giá sản phẩm thành công!", savedProduct)
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.dashboard = async (req, res) => {
  try {
    let query = {
      status: req.query.status || "active",
    };
    const products = await Product.findAll({
      where: query,
      order: [["rate", "DESC"]],
    });

    const payload = products.slice(0, 10);

    const results = [];
    payload.map((item) => {
      results.push({ name: `${item.name}-${item.code}`, total: item.rate });
    });

    res.json(
      responsePayload(
        true,
        "Tải top 10 danh sách sản phẩm được đánh giá cao thành công!",
        results
      )
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};
