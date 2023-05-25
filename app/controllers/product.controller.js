const db = require("../models");
const Product = db.product;
const InvoiceItems = db.invoiceItem;
const { Op } = require("sequelize");

responsePayload = (status, message, payload) => ({
  status,
  message,
  payload,
});
exports.findAll = async (req, res) => {
  try {
    let query = {
      status: req.query.status || "active",
      name: { [Op.like]: `%${req.query.keyword}%` },
    };
    if (req.query.categoryCode) query.categoryCode = req.query.categoryCode;
    if (req.query.subCategoryCode)
      query.subCategoryCode = req.query.subCategoryCode;
    if (req.query.size) query.size = req.query.size;
    if (req.query.event) query.event = req.query.event;
    if (req.query.style) query.style = req.query.style;
    if (req.query.material) query.material = req.query.material;

    if (req.query.priceTo && req.query.priceFrom)
      query.price = {
        [Op.and]: [
          { [Op.gte]: parseInt(req.query.priceFrom) },
          { [Op.lte]: parseInt(req.query.priceTo) },
        ],
      };
    const order = [];
    if (req.query.sortBy)
      order.push([req.query.sortBy, req.query.orderBy || "ASC"]);

    const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;
    const total = await Product.findAll({ where: query });
    const totalPage = Math.ceil(total.length / limit);
    const products = await Product.findAll({
      where: query,
      limit,
      offset,
      order,
    });
    res.json(
      responsePayload(true, "Tải danh sách sản phẩm thành công!", {
        items: products,
        meta: {
          currentPage: page + 1,
          limit,
          totalItems: total.length,
          totalPage,
        },
      })
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.findById = async (req, res) => {
  try {
    if (!req.params.id)
      return res
        .status(400)
        .json(responsePayload(false, "Đường dẫn thiêú mã sản phẩm!", null));
    const product = await Product.findOne({
      where: {
        code: req.params.id,
        status: { [Op.ne]: "removed" },
      },
    });
    if (!product)
      return res.json(
        responsePayload(false, "sản phẩm không tồn tại!", product)
      );
    res.json(
      responsePayload(true, "Tải thông tin sản phẩm thành công!", product)
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.params.id)
      return res
        .status(400)
        .json(responsePayload(false, "Đường dẫn thiêú mã sản phẩm!", null));
    const product = await Product.findOne({
      where: {
        code: req.params.id,
      },
    });
    if (!product)
      return res
        .status(400)
        .json(responsePayload(false, "sản phẩm không tồn tại!", null));
    if (product.status === "removed")
      return res
        .status(400)
        .json(
          responsePayload(false, "Không thể cập nhật sản phẩm đã bị xoá!", null)
        );

    const excludeKeys = ["code", "id", "createdAt", "updatedAt"];
    for (const key in req.body) {
      if (!excludeKeys.includes(key)) product[key] = req.body[key];
    }
    await product.save();
    const savedProduct = await Product.findOne({
      where: {
        code: req.params.id,
      },
    });
    res.json(
      responsePayload(
        true,
        "Cập nhật thông tin sản phẩm thành công!",
        savedProduct
      )
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.create = async (req, res) => {
  try {
    const productByCategory = await Product.findAll({
      where: {
        categoryCode: req.body.categoryCode,
        subCategoryCode: req.body.subCategoryCode,
      },
    });
    const product = await Product.create({
      ...req.body,
      code: `${req.body.categoryCode}-${req.body.subCategoryCode}-${
        productByCategory.length + 1
      }`,
    });
    res.json(responsePayload(true, "Tạo sản phẩm thành công!", product));
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
  const productByCategory = await Product.findAll({
    where: {
      categoryCode: req.body.categoryCode,
      subCategoryCode: req.body.subCategoryCode,
    },
  });
};

exports.remove = async (req, res) => {
  try {
    if (!req.params.id)
      return res
        .status(400)
        .json(responsePayload(false, "Đường dẫn thiêú mã sản phẩm!", null));
    const product = await Product.findOne({
      where: {
        code: req.params.id,
      },
    });
    if (!product)
      return res
        .status(400)
        .json(responsePayload(false, "Sản phẩm không tồn tại!", product));
    if (product.status === "removed")
      return res
        .status(400)
        .json(responsePayload(false, "Sản phẩm này đã bị xoá!", product));
    product.status = "removed";
    await product.save();
    res.json(responsePayload(true, "Xoá sản phẩm thành công!", product));
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
  // const productByCategory = await Product.findAll({
  //   where: {
  //     categoryCode: req.body.categoryCode,
  //     subCategoryCode: req.body.subCategoryCode,
  //   },
  // });
};

exports.dashboard = async (req, res) => {
  try {
    let query = {
      status: req.query.status || "active",
    };
    const products = await Product.findAll({
      where: query,
      include: InvoiceItems,
      order: [["name", "ASC"]],
    });

    let payload = [];
    products.map((product) => {
      let total = 0;
      product.invoiceItems.map((item) => {
        total += item.total;
      });
      payload.push({ name: `${product.name}${product.code}`, total });
    });
    payload = payload.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
    payload = payload.slice(0, 10);

    res.json(
      responsePayload(
        true,
        "Tải top 10 danh sách sản phẩm bán chạy thành công!",
        payload
      )
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};
