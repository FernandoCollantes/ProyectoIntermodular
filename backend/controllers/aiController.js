const aiService = require('../services/aiService');
const pdf = require('pdf-parse');
const fs = require('fs');

exports.generateFromPdf = async (req, res) => {
    try {
        // 1. Validar archivo
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No se subió ningún PDF." });
        }

        // 2. Extraer metadatos del cuerpo de la petición (FormData)
        const { asignatura, tema, numPreguntas, dificultad } = req.body;
        const count = parseInt(numPreguntas) || 10;
        const diff = parseInt(dificultad) || 1; // Default to Middle (1)

        if (!asignatura) {
            // Borramos el archivo si faltan datos para no dejar basura
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: "Falta la asignatura." });
        }

        // 3. Leer y extraer texto del PDF
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdf(dataBuffer);
        const textContent = pdfData.text;

        if (!textContent || textContent.length < 50) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: "El PDF parece vacío." });
        }

        // 4. Llamar a la IA pasando los parámetros correctos
        const generatedQuestions = await aiService.generateQuestionsFromText(textContent, asignatura, tema, count, diff);

        // 5. Limpieza
        fs.unlinkSync(req.file.path);

        // 6. Responder
        res.json({ success: true, questions: generatedQuestions });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};