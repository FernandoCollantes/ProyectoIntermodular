const AsignaturaModel = require('../models/Asignatura');
const CriterioModel = require('../models/Criterio');
const CursoModel = require('../models/Curso'); // Necesario para filtrar

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

// --- ASIGNATURAS ---
exports.createAsignatura = async (codigo, nombre) => {
    const nueva = new AsignaturaModel({ _id: codigo, nombre });
    return await nueva.save();
};

// MODIFICADO: Lógica de filtrado
exports.getAsignaturas = async (cursoId) => {
    if (cursoId) {
        // Si nos piden un curso, buscamos el curso y devolvemos SUS asignaturas
        const curso = await CursoModel.findById(cursoId).populate('asignaturas');
        return curso ? curso.asignaturas : [];
    } else {
        // Si no, devolvemos todas las del sistema
        return await AsignaturaModel.find().sort({ nombre: 1 });
    }
};

// --- CRITERIOS ---
exports.createCriterio = async (nombre, descripcion, asignaturaId) => {
    const nuevo = new CriterioModel({ nombre, descripcion, asignatura: asignaturaId });
    return await nuevo.save();
};

exports.getCriterios = async (asignaturaId) => {
    const query = asignaturaId ? { asignatura: asignaturaId } : {};
    return await CriterioModel.find(query).populate('asignatura', 'nombre').sort({ nombre: 1 });
};