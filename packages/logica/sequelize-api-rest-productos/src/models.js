const { DataTypes } = require("sequelize");

function defineModels(sequelize) {
  const Producto = sequelize.define(
    "Producto",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      precio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 },
      },
    },
    {
      tableName: "productos_sequelize",
      underscored: true,
    },
  );

  return { Producto };
}

module.exports = {
  defineModels,
};
