module.exports = (sequelize, Sequelize, DataTypes) => {
  const Role = sequelize.define(
    "role", // Model name
    {
      // Attributes
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      roleCode: {
        type: DataTypes.STRING,
        default: "user",
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

  return Role;
};
