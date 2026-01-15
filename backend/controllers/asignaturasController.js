const asignaturasService = require('../services/asignaturasService');

exports.createAsignatura = async (req, res) => {
    try {
        const { codigo, nombre } = req.body; 
        if (!codigo || !nombre) return res.status(400).json({ message: "Código y Nombre requeridos" });
        const data = await asignaturasService.createAsignatura(codigo, nombre);
        res.json({ success: true, data });
    } catch (error) { 
        if (error.code === 11000) return res.status(400).json({ success: false, message: "Código duplicado." });
        res.status(500).json({ success: false, message: error.message }); 
    }
};

exports.getAsignaturas = async (req, res) => {
    try { res.json({ success: true, subjects: await asignaturasService.getAsignaturas() }); } 
    catch (e) { res.status(500).json({success:false, message: e.message}); }
};

exports.createCriterio = async (req, res) => {
    try {
        const { nombre, descripcion, asignaturaId } = req.body;
        const data = await asignaturasService.createCriterio(nombre, descripcion, asignaturaId);
        res.json({ success: true, data });
    } catch (e) { res.status(500).json({success:false, message: e.message}); }
};

exports.getCriterios = async (req, res) => {
    try {
        const { asignatura } = req.query; 
        const criterios = await asignaturasService.getCriterios(asignatura);
        res.json({ success: true, criterios });
    } catch (e) { res.status(500).json({success:false, message: e.message}); }
};