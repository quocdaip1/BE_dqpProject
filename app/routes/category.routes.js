const { authJwt } = require("../middlewares");
const controller = require("../controllers/category.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers");

    next();
  });

  app.get("/api/categories/", controller.findAll);

  app.get("/api/categories/nopage/", controller.findAllNoPage);

  app.get("/api/categories/parent/", controller.findAllParent);

  app.post("/api/categories", controller.create);

  app.get("/api/categories/:id", controller.findById);

  app.put("/api/categories/:id", controller.update);

  app.delete("/api/categories/remove/:id", controller.remove);
};
