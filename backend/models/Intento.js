const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IntentoSchema = new Schema({
    examen_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Examen', 
        required: true 
    },
    alumno: { 
        type: String, 
        default: 'Invitado' // Futuro: ID de usuario
    },
    respuestas: [{
        pregunta_id: { type: Schema.Types.ObjectId, ref: 'Pregunta' },
        respuesta_marcada: String,
        es_correcta: Boolean
    }],
    nota: { type: Number, required: true }, // Nota sobre 10
    fecha_intento: { type: Date, default: Date.now }
}, { collection: 'Intentos' });

module.exports = mongoose.model('Intento', IntentoSchema);