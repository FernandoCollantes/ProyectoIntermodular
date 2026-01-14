const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExamenSchema = new Schema({
    nombre: { type: String, required: true },
    
    asignatura: { 
        type: String, // ID String manual (Código)
        ref: 'Asignatura',
        required: true 
    },
    
    autor: { type: String, default: 'admin' },
    
    // NUEVO CAMPO: Diferenciador
    tipo: {
        type: String,
        enum: ['OFICIAL', 'PRACTICA'],
        default: 'PRACTICA',
        required: true
    },
    
    criterios_abarcados: [{ type: Schema.Types.ObjectId, ref: 'Criterio' }],
    preguntas: [{ type: Schema.Types.ObjectId, ref: 'Pregunta' }],
    
    fecha_creacion: { type: Date, default: Date.now }
}, { collection: 'Examenes' });

module.exports = mongoose.model('Examen', ExamenSchema);