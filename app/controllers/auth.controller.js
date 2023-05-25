const config = require("../config/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Invoice = db.invoice;

responsePayload = (status, message, payload) => ({
  status,
  message,
  payload,
});

exports.signup = async (req, res) => {
  try {
    const role = await Role.findOne({
      where: {
        name: req.body.role,
      },
    });
    if (!role)
      res
        .status(400)
        .json(responsePayload(false, "Role code không tồn tại!", null));
    const user = await User.create({
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phonenumber: req.body.phonenumber,
    });
    await user.setRole(role);
    res.json(
      responsePayload(
        true,
        "Đăng ký tài khoản thành công! Vui lòng trở lại đăng nhập để tiếp tục!",
        user
      )
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
      include: [{ model: Role }, { model: Invoice }],
    });
    if (!user) {
      return res
        .status(400)
        .json(responsePayload(false, "Người dùng này không tồn tại!", null));
    }

    let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res
        .status(401)
        .json(responsePayload(true, "Mật khẩu không đúng!", null));
    }

    if (user.status === "inactive")
      return res
        .status(404)
        .json(responsePayload(true, "Tài khoản này đã bị khoá!", null));

    let token = jwt.sign({ id: user.id }, config.auth.secret, {
      expiresIn: 86400, // 24 hours
    });
    res.json(
      responsePayload(true, "Đăng nhập thành công!", {
        accessToken: token,
        user,
      })
    );
  } catch (err) {
    res.status(500).json(responsePayload(false, err.message, null));
  }
};
