const PDFDocument = require('pdfkit');

/**
 * Generates a PDF for the given exam data
 * @param {Object} data - Exam data (title, questions, etc.)
 * @returns {PDFDocument} - The PDF document object (stream)
 */
exports.generateExamPdf = (data) => {
    const doc = new PDFDocument({ margin: 50 });

    // 1. Header
    doc.fontSize(20).text(data.nombre || 'Examen', { align: 'center' });
    doc.moveDown();

    if (data.fecha_creacion) {
        const dateStr = new Date(data.fecha_creacion).toLocaleDateString('es-ES');
        doc.fontSize(12).text(`Fecha: ${dateStr}`, { align: 'right' });
    }
    doc.moveDown(2);

    // 2. Questions
    if (data.preguntas && Array.isArray(data.preguntas)) {
        data.preguntas.forEach((pregunta, index) => {
            // Title: "1. This is the question text..."
            doc.font('Helvetica-Bold').fontSize(12)
                .text(`${index + 1}. ${pregunta.enunciado}`);

            doc.moveDown(0.5);

            // Options
            if (pregunta.opciones && Array.isArray(pregunta.opciones)) {
                doc.font('Helvetica').fontSize(11);
                pregunta.opciones.forEach((opcion, optIndex) => {
                    const letter = String.fromCharCode(97 + optIndex); // a, b, c...
                    doc.text(`${letter}) ${opcion}`, { indent: 20 });
                });
            }

            doc.moveDown(1.5);
        });
    } else {
        doc.text('No hay preguntas en este examen.');
    }

    // 3. Answer Key (Optional - added at the end)
    doc.addPage();
    doc.fontSize(16).text('Hoja de Respuestas', { align: 'center', underline: true });
    doc.moveDown();

    if (data.preguntas && Array.isArray(data.preguntas)) {
        data.preguntas.forEach((pregunta, index) => {
            const correctOptIndex = pregunta.respuesta_correcta; // index 0-3
            const letter = String.fromCharCode(97 + correctOptIndex);
            doc.fontSize(11).text(`${index + 1}. ${letter}`);
        });
    }

    doc.end();
    return doc;
};
