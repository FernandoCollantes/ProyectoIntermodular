const express = require('express');
const router = express.Router();
const controller = require('../controllers/preguntasController');

router.get('/search', controller.searchQuestions);
router.get('/:id', controller.getQuestionById);
router.post('/add', controller.addQuestion);
router.post('/bulk', controller.bulkAdd);
router.delete('/:id', controller.deleteQuestion);
router.put('/:id', controller.updateQuestion);
router.post('/download-pdf', controller.downloadPdf);

module.exports = router;