const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SesionExamenSchema = new Schema({
    examen_id: {
        type: Schema.Types.ObjectId,
        ref: 'Examen',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    invitados_emails: [{
        type: String
    }],
    creador: {
        type: String,
        required: true
    },
    activa: {
        type: Boolean,
        default: true
    }
}, {
    collection: 'SesionesExamen',
    timestamps: true
});

module.exports = mongoose.model('SesionExamen', SesionExamenSchema);
