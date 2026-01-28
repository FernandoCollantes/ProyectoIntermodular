const asignaturasService = require('../services/asignaturasService');

// --- CURSOS ---
exports.getCursos = async (req, res) => {
    try {
        const cursos = await asignaturasService.getCursos();
        res.json({ success: true, cursos });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createCurso = async (req, res) => {
    try {
        const { id, nombre, asignaturas } = req.body;
        await asignaturasService.createCurso(id, nombre, asignaturas);
        res.json({ success: true, message: "Curso creado" });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// --- ASIGNATURAS ---
exports.getAsignaturas = async (req, res) => {
    try {
        const { curso } = req.query;
        const subjects = await asignaturasService.getAsignaturas(curso);
        res.json({ success: true, subjects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createAsignatura = async (req, res) => {
    try {
        const { codigo, nombre } = req.body;
        if (!codigo || !nombre) return res.status(400).json({ message: "Datos requeridos" });
        const data = await asignaturasService.createAsignatura(codigo, nombre);
        res.json({ success: true, data });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ success: false, message: "Duplicado" });
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- RESULTADOS DE APRENDIZAJE ---
exports.getResultadosAprendizaje = async (req, res) => {
    try {
        const { asignatura } = req.query;
        const results = await asignaturasService.getResultadosAprendizaje(asignatura);
        res.json({ success: true, results });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createResultadoAprendizaje = async (req, res) => {
    try {
        const { nombre, descripcion, asignaturaId } = req.body;
        const data = await asignaturasService.createResultadoAprendizaje(nombre, descripcion, asignaturaId);
        res.json({ success: true, data });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// --- CRITERIOS ---
exports.createCriterio = async (req, res) => {
    try {
        const { nombre, descripcion, resultadoId } = req.body;
        const data = await asignaturasService.createCriterio(nombre, descripcion, resultadoId);
        res.json({ success: true, data });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getCriterios = async (req, res) => {
    try {
        const { resultado } = req.query;
        const criterios = await asignaturasService.getCriterios(resultado);
        res.json({ success: true, criterios });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};