module.exports = (sequelize, Sequelize, DataTypes) => {
  const User = sequelize.define(
    "user", // Model name
    {
      // Attributes
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phonenumber: {
        type: DataTypes.STRING,
        allowNull: true,
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

  return User;
};
