const { authJwt } = require("../middlewares");
const controller = require("../controllers/ratting.controller");
const { productValidator } = require("../middlewares");
const { isAdmin } = require("../middlewares/authJwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/rattings/",
    [authJwt.verifyToken, isAdmin],
    controller.dashboard
  );
  app.post("/api/rattings/", [authJwt.verifyToken], controller.create);
};
