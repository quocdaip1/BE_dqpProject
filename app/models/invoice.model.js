module.exports = (sequelize, Sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    "invoice", // Model name
    {
      // Model attributes
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      total: {
        type: DataTypes.FLOAT
      },
      subTotal: {
        type: DataTypes.FLOAT
      },
      totalPaid: {
        type: DataTypes.FLOAT
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
    },
    {
      // Options
      timestamps: true,
      underscrored: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  );

  return Invoice;
};
