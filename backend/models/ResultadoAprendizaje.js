const mongoose = require('mongoose');

const ResultadoAprendizajeSchema = new mongoose.Schema({
    codigo: { // Ejemplo: "RA1"
        type: String,
        required: true,
        trim: true
    },
    texto: { // El enunciado largo del RA
        type: String,
        required: true
    },
    asignatura: { // Nombre del módulo al que pertenece
        type: String,
        required: true
    }
}, { collection: 'ResultadosAprendizaje' });

module.exports = mongoose.models.ResultadoAprendizaje || mongoose.model('ResultadoAprendizaje', ResultadoAprendizajeSchema);