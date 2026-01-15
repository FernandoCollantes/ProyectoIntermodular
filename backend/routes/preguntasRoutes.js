const express = require('express');
const router = express.Router();
const controller = require('../controllers/preguntasController');

router.get('/search', controller.searchQuestions);
router.post('/', controller.addQuestion);

module.exports = router;