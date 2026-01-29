const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExamenSchema = new Schema({
    titulo: {
        type: String,
        required: true
    },
    asignatura: {
        type: String,
        required: true
    },
    ras: [{
        type: String
    }], // Array of RA codes
    duracion: {
        type: Number,
        required: true
    }, // minutes
    intentos: {
        type: Number,
        default: 1
    },
    preguntas: [{
        type: Schema.Types.ObjectId,
        ref: 'Pregunta'
    }],
    opciones: {
        aleatorio: { type: Boolean, default: false },
        respuestas_inmediatas: { type: Boolean, default: false },
        limite_tiempo: { type: Boolean, default: true },
        navegacion_libre: { type: Boolean, default: false }
    },
    estado: {
        type: String,
        enum: ['borrador', 'publicado'],
        default: 'borrador'
    },
    creador: {
        type: String,
        required: true
    }
}, {
    collection: 'Examenes',
    timestamps: true
});

module.exports = mongoose.model('Examen', ExamenSchema);