const express = require('express');
const router = express.Router();
const controller = require('../controllers/asignaturasController');

router.get('/', controller.getAsignaturas);
router.post('/', controller.createAsignatura);

router.get('/criterios', controller.getCriterios); // /api/asignaturas/criterios
router.post('/criterios', controller.createCriterio);

module.exports = router;