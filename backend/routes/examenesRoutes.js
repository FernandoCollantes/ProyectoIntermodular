const express = require('express');
const router = express.Router();
const controller = require('../controllers/examenesController');

router.post('/preview', controller.previewExam);
router.post('/save', controller.saveExam);
router.get('/search', controller.searchExams);
router.get('/:id/pdf', controller.downloadExamById);
router.post('/pdf-preview', controller.downloadPdfDirect); // Para descargar sin guardar

module.exports = router;