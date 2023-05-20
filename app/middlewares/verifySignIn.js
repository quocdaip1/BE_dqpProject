responsePayload = (status, message, payload) => ({
  status, message, payload
});

validatior = (req, res, next) => {
  // Username
  if (!req.body.email)
    return res.status(400).send(responsePayload(false, "Vui lòng nhập email!", null));
  if (!req.body.password)
    return res
      .status(400)
      .json(responsePayload(false, "Vui lòng nhập mật khẩu!", null));

  next();
};

const verifySignIn = {
  validatior: validatior,
};

module.exports = verifySignIn;
