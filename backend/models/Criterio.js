const mongoose = require('mongoose');

const CriterioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    
    // CAMBIO: La referencia ahora es un String (el código de la asignatura)
    asignatura: { 
        type: String, // Antes: Schema.Types.ObjectId
        ref: 'Asignatura',
        required: true 
    }
}, { collection: 'Criterios' });

module.exports = mongoose.model('Criterio', CriterioSchema);