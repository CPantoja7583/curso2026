const { DataTypes } = require("sequelize");

function defineModels(sequelize) {
  const Cliente = sequelize.define(
    "Cliente",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
    },
    {
      tableName: "clientes",
      timestamps: false,
    },
  );

  return { Cliente };
}

module.exports = {
  defineModels,
};
