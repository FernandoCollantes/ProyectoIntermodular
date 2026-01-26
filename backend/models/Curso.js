const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({
    _id: { 
        type: String, // Ej: "DAM1"
        required: true,
        uppercase: true,
        trim: true
    },
    nombre: { 
        type: String, 
        required: true 
    },
    // AQUÍ ESTÁ LA REFERENCIA: Un curso "tiene" asignaturas
    asignaturas: [{ 
        type: String, 
        ref: 'Asignatura'
    }]
}, { collection: 'Cursos' });

module.exports = mongoose.model('Curso', CursoSchema);