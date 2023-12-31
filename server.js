const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const config = require("./app/config/config.js");

const app = express();

const corsOptions = {
  origin: "http://127.0.0.1:5173",
  // Allow follow-up middleware to override this CORS for options
  preflightContinue: true,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const Role = db.role;
const User = db.user;

db.sequelize.sync().then(() => {
  initial(); // Just use it in development, at the first time execution!. Delete it in production
});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Hi there, welcome to this tutorial." });
});

// api routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/category.routes")(app);
require("./app/routes/product.routes")(app);
require("./app/routes/invoice.routes")(app);
require("./app/routes/ratting.routes")(app);
require("./app/routes/bookmark.route")(app);

// set port, listen for requests
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function initial() {
  await Role.findOrCreate({
    where: { id: "82705bfa-cede-46e4-afca-5541b6068671" },
    defaults: {
      name: "Admin",
      roleCode: "admin",
    },
  });

  await Role.findOrCreate({
    where: { id: "37dcfe4d-c74a-469b-9a25-61961e568ce1" },
    defaults: {
      name: "User",
      roleCode: "user",
    },
  });

  await User.findOrCreate({
    where: { email: "admin@gmail.com" },
    defaults: {
      email: "admin@gmail.com",
      firstName: "Admin",
      lastName: "Project",
      password: bcrypt.hashSync("123456", 8),
      phonenumber: "123456789",
      roleId: "82705bfa-cede-46e4-afca-5541b6068671",
    },
  });
}
