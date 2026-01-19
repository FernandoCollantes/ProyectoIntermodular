const express = require('express');
const router = express.Router();
const controller = require('../controllers/examenesController');

router.post('/preview', controller.previewExam);
router.post('/save', controller.saveExam);
router.get('/search', controller.searchExams);
router.get('/:id/pdf', controller.downloadExamById);
router.post('/pdf-preview', controller.downloadPdfDirect); // Para descargar sin guardar

router.get('/:id/take', controller.getExamForStudent); // Obtener examen para hacer (JSON limpio)
router.post('/:id/submit', controller.submitExam);     // Enviar respuestas y corregir
router.get('/student/attempts', controller.getAttempts); // Obtener historial de intentos

router.get('/:id/export-json', controller.exportExamAsJson); // Obtener examen como JSON

module.exports = router;