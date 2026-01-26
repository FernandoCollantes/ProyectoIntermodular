const mongoose = require('mongoose');

const AsignaturaSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        required: true,
        uppercase: true,
        trim: true
    },
    nombre: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    }
}, { collection: 'Asignaturas' });

// Comprueba si el modelo ya existe antes de compilarlo para evitar errores en re-cargas
module.exports = mongoose.models.Asignatura || mongoose.model('Asignatura', AsignaturaSchema);