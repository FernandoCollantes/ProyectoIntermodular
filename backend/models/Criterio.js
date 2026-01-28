const mongoose = require('mongoose');

const CriterioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },

    // La referencia ahora es al Resultado de Aprendizaje
    resultadoAprendizaje: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResultadoAprendizaje',
        required: true
    }
}, { collection: 'Criterios' });

module.exports = mongoose.model('Criterio', CriterioSchema);