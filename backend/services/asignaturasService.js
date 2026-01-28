const AsignaturaModel = require('../models/Asignatura');
const CriterioModel = require('../models/Criterio');
const CursoModel = require('../models/Curso');
const ResultadoAprendizajeModel = require('../models/ResultadoAprendizaje');

// --- CURSOS ---
exports.getCursos = async () => {
    return await CursoModel.find().sort({ _id: 1 });
};

exports.createCurso = async (id, nombre, asignaturasIds) => {
    const nuevo = new CursoModel({
        _id: id,
        nombre,
        asignaturas: asignaturasIds || []
    });
    return await nuevo.save();
};

// --- RESULTADOS DE APRENDIZAJE ---
exports.createResultadoAprendizaje = async (nombre, descripcion, asignaturaId) => {
    const nuevo = new ResultadoAprendizajeModel({ nombre, descripcion, asignatura: asignaturaId });
    return await nuevo.save();
};

exports.getResultadosAprendizaje = async (asignaturaId) => {
    const query = asignaturaId ? { asignatura: asignaturaId } : {};

    // Filtrar solo RAs con nombre válido (no vacío, no null, no undefined)
    query.nombre = { $exists: true, $ne: null, $ne: "" };

    return await ResultadoAprendizajeModel.find(query)
        .where('nombre').ne(null)  // Doble verificación
        .sort({ nombre: 1 });
};

// --- ASIGNATURAS ---
exports.createAsignatura = async (codigo, nombre) => {
    const nueva = new AsignaturaModel({ _id: codigo, nombre });
    return await nueva.save();
};

exports.getAsignaturas = async (cursoId) => {
    if (cursoId) {
        const curso = await CursoModel.findById(cursoId).populate('asignaturas');
        return curso ? curso.asignaturas : [];
    } else {
        return await AsignaturaModel.find().sort({ nombre: 1 });
    }
};

// --- CRITERIOS ---
exports.createCriterio = async (nombre, descripcion, resultadoId) => {
    const nuevo = new CriterioModel({ nombre, descripcion, resultadoAprendizaje: resultadoId });
    return await nuevo.save();
};

exports.getCriterios = async (resultadoId) => {
    const query = resultadoId ? { resultadoAprendizaje: resultadoId } : {};

    // Filtrar solo Criterios con nombre válido
    query.nombre = { $exists: true, $ne: null, $ne: "" };

    return await CriterioModel.find(query)
        .populate('resultadoAprendizaje', 'nombre')
        .where('nombre').ne(null)  // Doble verificación
        .sort({ nombre: 1 });
};