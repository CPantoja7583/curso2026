class Pelicula {
  constructor(nombre, director, anioEstreno) {
    this.nombre = nombre;
    this.director = director;
    this.anioEstreno = Number(anioEstreno);
  }
}

class Serie {
  constructor(nombre, anioEstreno, numeroTemporadas) {
    this.nombre = nombre;
    this.anioEstreno = Number(anioEstreno);
    this.numeroTemporadas = Number(numeroTemporadas);
  }
}

module.exports = { Pelicula, Serie };
