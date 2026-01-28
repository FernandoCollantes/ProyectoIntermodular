const express = require('express');
const router = express.Router();
const controller = require('../controllers/asignaturasController');

// Rutas de Cursos (Nuevas)
router.get('/cursos', controller.getCursos);
router.post('/cursos', controller.createCurso);

// Rutas de Asignaturas
router.get('/', controller.getAsignaturas);
router.post('/', controller.createAsignatura);

// Rutas de Resultados de Aprendizaje
router.get('/resultados-aprendizaje', controller.getResultadosAprendizaje);
router.post('/resultados-aprendizaje', controller.createResultadoAprendizaje);

// Rutas de Criterios
router.get('/criterios', controller.getCriterios);
router.post('/criterios', controller.createCriterio);

module.exports = router;