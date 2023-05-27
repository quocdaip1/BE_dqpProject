module.exports = (sequelize, Sequelize, DataTypes) => {
  const Product = sequelize.define(
    "product", // Model name
    {
      // Model attributes
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      code: {
        type: DataTypes.STRING,
      },
      categoryCode: {
        type: DataTypes.STRING,
      },
      subCategoryCode: {
        type: DataTypes.STRING,
      },
      image: {
        type: DataTypes.STRING,
      },
      price: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      size: {
        type: DataTypes.STRING,
        defaultValue: 'small',
        allowNull: true,
      },
      material: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      event: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      style: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rate: {
        type: DataTypes.FLOAT,
        allowNull: true,
        default: 0,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "active",
      },
    },
    {
      // Options
      timestamps: true,
      underscrored: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return Product;
};
