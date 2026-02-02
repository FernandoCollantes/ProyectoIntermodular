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

// ============================================================================
// NEW EXAM MANAGEMENT ROUTES (Draft/Published System)
// ============================================================================
router.post('/', controller.addExam);                    // Create exam
router.get('/mis-examenes', controller.getMisExamenes);  // Get published exams
router.get('/borradores', controller.getBorradores);     // Get draft exams
router.get('/:id', controller.getExamById);              // Get exam by ID
router.put('/:id', controller.updateExam);               // Update exam
router.delete('/:id', controller.deleteExam);            // Delete exam
router.patch('/:id/publicar', controller.publishExamById); // Publish draft

// ============================================================================
// SHARED EXAM & RESULTS ROUTES
// ============================================================================
router.post('/:id/compartir', controller.shareExam);         // Share exam
router.get('/sesion/:token', controller.getSessionByToken);  // Get session (student)
router.post('/sesion/:id/submit', controller.submitSessionExam); // Submit results
router.get('/sesion/check/:token', controller.checkStudentStatusByToken);   // Check if already taken by token
router.get('/sesiones/resultados', controller.getSessionsResults); // Results dashboard
router.get('/intento/:id', controller.getAttemptDetails);    // Attempt details for student review
router.delete('/sesion/:id', controller.deleteSession);      // Delete session and results

module.exports = router;