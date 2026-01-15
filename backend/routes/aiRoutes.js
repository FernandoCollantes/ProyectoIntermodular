const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const multer = require('multer');

// Configuración temporal de subida
const upload = multer({ dest: 'uploads/' });

// POST /api/ai/upload-pdf
// 'pdfFile' es el nombre del campo que enviaremos desde el frontend
router.post('/upload-pdf', upload.single('pdfFile'), aiController.generateFromPdf);

module.exports = router;