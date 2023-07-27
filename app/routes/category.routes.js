const { authJwt } = require("../middlewares");
const controller = require("../controllers/category.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers");

    next();
  });

  app.get("/api/categories/", controller.findAll);

  app.get("/api/categories/nopage/", controller.findAllNoPage);

<<<<<<< HEAD
  app.get("/api/categories/parent/", controller.findAllParent);

=======
<<<<<<< HEAD
  app.get("/api/categories/parent/", controller.findAllParent);

=======
>>>>>>> 80f8b0514cb94e9f031268b3e608cbb868119eee
>>>>>>> 998b70607e1804ccfb79c607a1f743f553e4661e
  app.post("/api/categories", controller.create);

  app.get("/api/categories/:id", controller.findById);

  app.put("/api/categories/:id", controller.update);

  app.delete("/api/categories/remove/:id", controller.remove);
};
