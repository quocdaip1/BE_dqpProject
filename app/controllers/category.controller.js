const db = require("../models");
const Category = db.category;
const Role = db.role;

const { Op } = require("sequelize");

const responsePayload = (status, message, payload) => ({
  status,
  message,
  payload,
});

exports.findAll = async (req, res) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.keyword) {
      query[Op.or] = [
        { label: { [Op.like]: `%${req.query.keyword}%` } },
        { value: { [Op.like]: `%${req.query.keyword}%` } },
      ];
    }
    const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;
    const { count, rows: categories } = await Category.findAndCountAll({
      where: query,
      limit,
      offset,
    });
    const totalPage = Math.ceil(count / limit);
    res.json(
      responsePayload(true, "Tải danh sách danh mục thành công!", {
        items: categories,
        meta: {
          currentPage: page + 1,
          limit,
          totalItems: count,
          totalPage,
        },
      })
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.findAllNoPage = async (req, res) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.keyword) {
      query[Op.or] = [
        { label: { [Op.like]: `%${req.query.keyword}%` } },
        { value: { [Op.like]: `%${req.query.keyword}%` } },
      ];
    }
    const categories = await Category.findAll({ where: query });

    res.json(
      responsePayload(true, "Tải danh sách danh mục thành công!", {
        items: categories,
        meta: {
          currentPage: 1,
          limit: categories.length,
          totalItems: categories.length,
          totalPage: 1,
        },
      })
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.findAllParent = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parent: null },
      attributes: ["id", "label", "value"],
    });

    res.json(
      responsePayload(true, "Tải danh sách danh mục thành công!", {
        items: categories,
        meta: {
          currentPage: 1,
          limit: categories.length,
          totalItems: categories.length,
          totalPage: 1,
        },
      })
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.create = async (req, res) => {
  try {
    // Check if the parent value is a number or an empty string and set it to null
    if (isNaN(req.body.parent) || req.body.parent === "") {
      req.body.parent = null;
    }

    const category = await Category.create(req.body);
    res.json(responsePayload(true, "Tạo danh mục thành công!", category));
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.findById = async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!categoryId) {
      return res
        .status(400)
        .json(responsePayload(false, "Thiếu ID danh mục!", null));
    }

    const category = await Category.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return res.json(responsePayload(false, "Danh mục không tồn tại!", null));
    }

    res.json(
      responsePayload(true, "Lấy thông tin danh mục thành công!", category)
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.update = async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!categoryId) {
      return res
        .status(400)
        .json(responsePayload(false, "Thiếu mã danh mục!", null));
    }

    const category = await Category.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return res
        .status(400)
        .json(responsePayload(false, "Danh mục không tồn tại!", null));
    }

    const excludeKeys = ["id", "createdAt", "updatedAt"];
    for (const key in req.body) {
      if (!excludeKeys.includes(key)) {
        category[key] = req.body[key];
      }
    }

    await category.save();

    const updatedCategory = await Category.findOne({
      where: { id: categoryId },
    });

    res.json(
      responsePayload(
        true,
        "Cập nhật thông tin danh mục thành công!",
        updatedCategory
      )
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.remove = async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!categoryId) {
      return res
        .status(400)
        .json(responsePayload(false, "Thiếu mã danh mục!", null));
    }

    const category = await Category.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      return res
        .status(400)
        .json(responsePayload(false, "Danh mục không tồn tại!", null));
    }

    await category.destroy();

    res.json(responsePayload(true, "Xóa danh mục thành công!", null));
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};
