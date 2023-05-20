const { authJwt } = require("../middlewares");
const controller = require("../controllers/product.controller");
const { productValidator } = require("../middlewares");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );

    next();
  });

  app.get("/api/products/", controller.findAll);

  app.post(
    "/api/products",
    [authJwt.verifyToken, authJwt.isAdmin, productValidator.validator],
    controller.create
  );

  app.get("/api/products/:id", controller.findById);

  app.put(
    "/api/products/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.update
  );

  app.put(
    "/api/products/remove/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.remove
  );
};
