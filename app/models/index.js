const config = require("../config/config.js");
const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(
  config.db.DB_NAME,
  config.db.DB_USER,
  config.db.DB_PASS,
  {
    host: config.db.DB_HOST,
    dialect: config.db.dialect,
    operatorsAliases: false,

    poll: {
      max: config.db.pool.max,
      min: config.db.pool.min,
      acquire: config.db.pool.acquire,
      idle: config.db.pool.idle,
    },
  }
);

const db = {};

db.Sequelize = Sequelize;
db.Op = Op;
db.sequelize = sequelize;

db.product = require("./product.model.js")(sequelize, Sequelize, DataTypes);
db.invoiceItem = require("./invoiceItem.model.js")(
  sequelize,
  Sequelize,
  DataTypes
);
db.invoice = require("./invoice.model.js")(sequelize, Sequelize, DataTypes);
db.user = require("./user.model.js")(sequelize, Sequelize, DataTypes);
db.role = require("./role.model.js")(sequelize, Sequelize, DataTypes);
db.ratting = require("./ratting.model.js")(sequelize, Sequelize, DataTypes);
db.savedProduct = require("./savedProduct.model.js")(sequelize, Sequelize, DataTypes);

db.role.hasMany(db.user);
db.user.belongsTo(db.role);
db.user.hasMany(db.invoice);
db.invoice.belongsTo(db.user);
db.invoice.hasMany(db.invoiceItem);
db.invoiceItem.belongsTo(db.invoice);
db.product.hasMany(db.invoiceItem);
db.invoiceItem.belongsTo(db.product);
db.product.hasMany(db.ratting);
db.ratting.belongsTo(db.product);
db.user.hasMany(db.ratting);
db.ratting.belongsTo(db.user);
db.user.hasMany(db.savedProduct);
db.savedProduct.belongsTo(db.user);
db.product.hasMany(db.savedProduct);
db.savedProduct.belongsTo(db.product);


db.ROLES = ["user", "admin"];

module.exports = db;
