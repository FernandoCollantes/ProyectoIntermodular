/**
 * Clase que representa una pregunta individual.
 * Sincronizada con el nuevo modelo de Módulos y RAs.
 */
class Pregunta {
  /**
   * @param {object} data - Datos crudos traídos de la base de datos.
   */
  constructor({ _id, enunciado, opciones, respuesta_correcta, asignatura, tema, dificultad, creador }) {
    this._id = _id;
    this.enunciado = enunciado;
    this.opciones = opciones;
    // Ajustamos al nombre del modelo de la DB (respuesta_correcta)
    this.respuesta_correcta = respuesta_correcta;
    this.asignatura = asignatura;
    this.tema = tema;
    this.dificultad = dificultad;
    this.creador = creador;

    // Generamos la versión mezclada para exámenes
    this.opcionesRandomizadas = this.randomizeOptions([...opciones]);
  }

  /**
   * Algoritmo de Fisher-Yates para mezclar un array aleatoriamente.
   */
  randomizeOptions(optionsArray) {
    if (!optionsArray) return [];
    for (let i = optionsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
    }
    return optionsArray;
  }

  /**
   * Devuelve los datos para el cliente.
   * Nota: Si es para un examen, ocultamos la respuesta. 
   * Si es para "Mis Preguntas", la incluimos.
   */
  getClientData(includeAnswer = true) {
    const data = {
      _id: this._id,
      enunciado: this.enunciado,
      asignatura: this.asignatura,
      tema: this.tema,
      dificultad: this.dificultad,
      opciones: this.opciones, // En modo edición/lista enviamos orden original
      creador: this.creador
    };

    if (includeAnswer) {
      data.respuesta_correcta = this.respuesta_correcta;
    }

    return data;
  }
}

module.exports = Pregunta;