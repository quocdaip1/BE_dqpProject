const { verifySignUp, verifySignIn } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept",
      "application/json; charset=utf-8"
    );

    next();
  });

  app.post(
    "/api/auth/signup",
    [verifySignUp.checkDuplicateEmail, verifySignUp.checkRolesExisted],
    controller.signup
  );

  app.post("/api/auth/signin", [verifySignIn.validatior], controller.signin);
};
