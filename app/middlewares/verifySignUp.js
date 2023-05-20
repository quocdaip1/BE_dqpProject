const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

responsePayload = (status, message, payload) => ({
  status, message, payload
});

checkDuplicateEmail = (req, res, next) => {
  // Username
  if (!req.body.email)
    return res.status(400).send(responsePayload(false, "Vui lòng nhập email!", null));
  if (!req.body.password)
    return res
      .status(400)
      .json(responsePayload(false, "Vui lòng nhập mật khẩu!", null));
  if (!req.body.role)
    return res
      .status(400)
      .json(responsePayload(false, "Vui lòng chọn quyền!", null));

  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (user) {
      res
        .status(400)
        .json(
          responsePayload(
            false,
            `Email "${req.body.email}" này đã được sử dụng!`,
            null
          )
        );
      return;
    }
    next();
  });
};

checkRolesExisted = (req, res, next) => {
  if (!ROLES.includes(req.body.role)) {
    res
      .status(400)
      .json(responsePayload(false, `Quyền này không tồn tại!`, null));
    return;
  }
  next();
};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
  checkRolesExisted: checkRolesExisted,
};

module.exports = verifySignUp;
