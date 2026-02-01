const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfesorSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    collection: 'Profesores',
    timestamps: true
});

module.exports = mongoose.model('Profesor', ProfesorSchema);
