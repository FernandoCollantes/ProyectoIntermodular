const mongoose = require('mongoose');

const ResultadoAprendizajeSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        default: ''
    },
    asignatura: {
        type: String,
        ref: 'Asignatura',
        required: true
    }
}, { collection: 'ResultadosAprendizaje' });

// Evitar errores si se vuelve a compilar el modelo
module.exports = mongoose.models.ResultadoAprendizaje || mongoose.model('ResultadoAprendizaje', ResultadoAprendizajeSchema);
