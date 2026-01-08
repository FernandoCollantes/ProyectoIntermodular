const mongoose = require('mongoose');

const AsignaturaSchema = new mongoose.Schema({
    // SOBRESCRIBIMOS el _id por defecto.
    // Ahora será el Código del Módulo (ej: "MP0485")
    _id: { 
        type: String, 
        required: true,
        uppercase: true, // Forzamos mayúsculas
        trim: true
    },
    nombre: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    }
}, { collection: 'Asignaturas' });

module.exports = mongoose.model('Asignatura', AsignaturaSchema);