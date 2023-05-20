const { authJwt } = require("../middlewares");
const controller = require("../controllers/invoice.controller");
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

  app.get("/api/invoices/", controller.findAll);

  app.post("/api/invoices", [authJwt.verifyToken], controller.create);

  app.get("/api/invoices/:id", controller.findById);

  app.put("/api/invoices/:id", [authJwt.verifyToken], controller.update);

  app.put(
    "/api/invoices/cancel/:id",
    [authJwt.verifyToken],
    controller.cancelInvoice
  );
  app.put(
    "/api/invoices/accept/:id",
    [authJwt.verifyToken, isAdmin],
    controller.acceptInvoice
  );
};
