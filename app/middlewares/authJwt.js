const jwt = require("jsonwebtoken");
const config = require("../config/config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

responsePayload = (status, message, payload) => ({
  status,
  message,
  payload,
});

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res
      .status(403)
      .json(
        responsePayload(false, "Cần cung cấp token để sử dụng API này!", null)
      );
  }

  jwt.verify(token, config.auth.secret, async (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json(responsePayload(false, "Token đã hết hạn!", null));
    }

    const user = await User.findOne({
      where: {
        id: decoded.id,
      },
    });
    if (!user)
      return res
        .status(401)
        .json(responsePayload(false, "Người dùng không tồn tại!", null));
    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  const user = await User.findOne({
    where: {
      id: req.userId,
    },
    include: Role,
  });
  if (user.role.roleCode !== "admin")
    return res
      .status(401)
      .json(responsePayload(false, "API giới hạn quyền Admin!", null));
  next();
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
};

module.exports = authJwt;
