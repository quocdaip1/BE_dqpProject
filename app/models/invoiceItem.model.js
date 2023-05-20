module.exports = (sequelize, Sequelize, DataTypes) => {
  const InvoiceItem = sequelize.define(
    "invoiceItem", // Model name
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
      quantity: {
        type: DataTypes.INTEGER
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

  return InvoiceItem;
};
