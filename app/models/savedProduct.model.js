module.exports = (sequelize, Sequelize, DataTypes) => {
  const ProductSaved = sequelize.define(
    "productSaved", // Model name
    {
      // Model attributes
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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

  return ProductSaved;
};
