const AsignaturaModel = require('../models/Asignatura');
const CriterioModel = require('../models/Criterio');

exports.createAsignatura = async (codigo, nombre) => {
    const nueva = new AsignaturaModel({ _id: codigo, nombre });
    return await nueva.save();
};

exports.getAsignaturas = async () => {
    return await AsignaturaModel.find().sort({ nombre: 1 });
};

exports.createCriterio = async (nombre, descripcion, asignaturaId) => {
    const nuevo = new CriterioModel({ nombre, descripcion, asignatura: asignaturaId });
    return await nuevo.save();
};

exports.getCriterios = async (asignaturaId) => {
    const query = asignaturaId ? { asignatura: asignaturaId } : {};
    return await CriterioModel.find(query)
        .populate('asignatura', 'nombre')
        .sort({ nombre: 1 });
};