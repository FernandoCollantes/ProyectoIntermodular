const examenesService = require('../services/examenesService');

exports.previewExam = async (req, res) => {
    try {
        const { subjectId, amount } = req.body; 
        const examPreview = await examenesService.generateExamPreview(subjectId, parseInt(amount));
        res.status(200).json({ success: true, exam: examPreview });
    } catch (e) { res.status(500).json({success:false, message: e.message}); }
};

exports.saveExam = async (req, res) => {
    try {
        const { nombre, asignaturaId, preguntasIds, autor } = req.body;
        const savedExam = await examenesService.saveExamToDb({ nombre, asignaturaId, preguntasIds, autor });
        res.status(201).json({ success: true, message: 'Guardado', examId: savedExam._id });
    } catch (e) { res.status(500).json({success:false, message: e.message}); }
};

exports.downloadPdfDirect = async (req, res) => {
    // Genera PDF desde datos enviados (Vista Previa)
    const examData = req.body;
    if (!examData) return res.status(400).send('No data');
    try {
        const doc = examenesService.generateExamPdf(examData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${examData.nombre}.pdf`);
        doc.pipe(res); doc.end();
    } catch (e) { res.status(500).send("Error PDF"); }
};

exports.searchExams = async (req, res) => {
    try {
        const { subjectId, autor } = req.query;
        const exams = await examenesService.searchExams(subjectId, autor);
        res.json({ success: true, exams });
    } catch (e) { res.status(500).json({success:false, message: e.message}); }
};

exports.downloadExamById = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await examenesService.generatePdfFromExamId(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Examen_${id}.pdf`);
        doc.pipe(res); doc.end();
    } catch (e) { res.status(500).send("Error PDF: " + e.message); }
};