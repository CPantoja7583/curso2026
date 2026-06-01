const { DataTypes } = require("sequelize");

function defineModels(sequelize) {
  const Pelicula = sequelize.define(
    "Pelicula",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      titulo: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "peliculas",
      timestamps: false,
    },
  );

  const Actor = sequelize.define(
    "Actor",
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
      fecha_nacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: "actores",
      timestamps: false,
    },
  );

  const PeliculasActores = sequelize.define(
    "PeliculasActores",
    {
      pelicula_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: Pelicula,
          key: "id",
        },
      },
      actor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: Actor,
          key: "id",
        },
      },
    },
    {
      tableName: "peliculas_actores",
      timestamps: false,
    },
  );

  Pelicula.belongsToMany(Actor, {
    through: PeliculasActores,
    foreignKey: "pelicula_id",
    otherKey: "actor_id",
  });

  Actor.belongsToMany(Pelicula, {
    through: PeliculasActores,
    foreignKey: "actor_id",
    otherKey: "pelicula_id",
  });

  return {
    sequelize,
    Pelicula,
    Actor,
    PeliculasActores,
  };
}

module.exports = {
  defineModels,
};
