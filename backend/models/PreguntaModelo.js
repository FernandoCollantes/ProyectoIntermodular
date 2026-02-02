const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PreguntaSchema = new Schema({
    enunciado: { type: String, required: true },
    opciones: [{ type: String, required: true }],
    respuesta_correcta: { type: Number, required: true }, // ¡Ahora es NUMBER! (0,1,2,3)

    asignatura: {
        type: String,
        required: true
    }, // Guardaremos el nombre del Módulo (ej: "Sistemas Informáticos")

    tema: {
        type: [String],
        required: true
    }, // Aquí guardaremos los códigos de los RAs (ej: ["RA1", "RA2"])

    dificultad: {
        type: Number,
        min: 0,
        max: 2,
        default: 1
    }, // 0:Fácil, 1:Media, 2:Difícil

    creador: { type: String, default: 'Sistema' }
}, {
    collection: 'Preguntas',
    timestamps: true
});

// Índices para optimización de búsquedas
PreguntaSchema.index({ asignatura: 1 });
PreguntaSchema.index({ tema: 1 });
PreguntaSchema.index({ creador: 1 });

module.exports = mongoose.model('Pregunta', PreguntaSchema);