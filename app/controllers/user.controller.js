const db = require("../models");
const User = db.user;
const Role = db.role;
const Product = db.product;
const Invoice = db.invoice;
const InvoiceItem = db.invoiceItem;
const { Op } = require("sequelize");

responsePayload = (status, message, payload) => ({
  status,
  message,
  payload,
});

exports.findAll = async (req, res) => {
  try {
    let query = {
      
    };
    if (req.query.status) query.status = req.query.status
    if (req.query.keyword)
      query[Op.or] = [
        { firstname: { [Op.like]: `%${req.query.keyword}%` } },
        { lastname: { [Op.like]: `%${req.query.keyword}%` } },
      ];
    const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;
    const total = await User.findAll({ where: query });
    const totalPage = Math.ceil(total.length / limit);
    const users = await User.findAll({
      where: query,
      include: Role,
      limit,
      offset,
    });
    res.json(
      responsePayload(true, "Tải danh sách người dùng thành công!", {
        items: users,
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
        .json(responsePayload(false, "Đường dẫn thiêú id người dùng!", null));
    const user = await User.findOne({
      where: {
        [Op.and]: [{ status: "active", id: req.params.id }],
      },
      include: [{ model: Invoice, include: [{ model: InvoiceItem, include: Product }, { model: User }] }, { model: Role }],
    });
    if (!user)
      return res.json(
        responsePayload(false, "Người dùng không tồn tại!", user)
      );
    res.json(
      responsePayload(true, "Tải thông tin người dùng thành công!", user)
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!req.params.id)
      return res
        .status(400)
        .json(responsePayload(false, "Đường dẫn thiêú id người dùng!", null));
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!user)
      return res
        .status(400)
        .json(responsePayload(false, "Người dùng không tồn tại!", user));
    for (const key in req.body) {
      user[key] = req.body[key];
    }
    await user.save();
    const savedUser = await User.findOne({
      where: {
        id: req.params.id,
      },
      inclue: Role,
    });
    res.json(
      responsePayload(
        true,
        "Cập nhật thông tin người dùng thành công!",
        savedUser
      )
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.updateStatus = async (req, res) => {
  try {
    if (!req.params.id)
      return res
        .status(400)
        .json(responsePayload(false, "Đường dẫn thiêú id người dùng!", null));
    const user = await User.findOne({
      where: {
        id: req.params.id,
      },
      include: Role,
    });
    if (!user)
      return res
        .status(400)
        .json(responsePayload(false, "Người dùng không tồn tại!", null));
    user.status = req.body.status || "active";
    await user.save();
    res.json(
      responsePayload(true, "Cập nhật trạng thái người dùng thành công!", user)
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};
