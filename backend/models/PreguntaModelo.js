const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PreguntaSchema = new Schema({
    enunciado: { type: String, required: true },
    opciones: [String],
    respuesta_correcta: { type: String, required: true },
    
    asignatura: { 
        type: String, 
        ref: 'Asignatura', 
        required: true 
    },
    
    // CAMBIO: Ahora es un ARRAY de referencias
    criterios_evaluacion: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Criterio',
        required: true 
    }],
    
    dificultad: { type: Number, min: 1, max: 10 } 
}, { collection: 'Preguntas' });

module.exports = mongoose.model('Pregunta', PreguntaSchema);