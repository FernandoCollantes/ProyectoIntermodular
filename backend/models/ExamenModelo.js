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
    preguntas: [{
        type: Schema.Types.ObjectId,
        ref: 'Pregunta'
    }],
    estado: {
        type: String,
        enum: ['borrador', 'publicado'],
        default: 'borrador'
    },
    duracion: {
        type: Number,
        default: 60
    },
    creador: {
        type: String,
        required: true
    }
}, {
    collection: 'Examenes',
    timestamps: true
});

// Índices para optimización de búsquedas
ExamenSchema.index({ asignatura: 1 });
ExamenSchema.index({ creador: 1 });
ExamenSchema.index({ estado: 1 });

module.exports = mongoose.model('Examen', ExamenSchema);