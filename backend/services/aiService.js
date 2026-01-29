const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "TU_CLAVE_AQUÍ"
});

// Mantén MOCK_MODE en true para probar sin gastar créditos
const MOCK_MODE = false;

exports.generateQuestionsFromText = async (textContext, asignatura, numQuestions = 5) => {
    try {
        if (MOCK_MODE) {
            console.log("⚠️ MODO SIMULACIÓN: Generando preguntas de prueba...");
            await new Promise(resolve => setTimeout(resolve, 1500));
            return Array.from({ length: numQuestions }, (_, i) => ({
                enunciado: `(Simulado) ¿Cuál es un concepto clave de ${asignatura}?`,
                opciones: ["Opción A (Correcta)", "Opción B", "Opción C", "Opción D"],
                respuesta_correcta: 0,
                tema: "RA1",
                dificultad: 1
            }));
        }

        const prompt = `
            Actúa como un profesor experto en el módulo de "${asignatura}".
            Basándote exclusivamente en el siguiente contenido técnico: "${textContext.substring(0, 10000)}"
            
            Genera exactamente ${numQuestions} preguntas de opción múltiple.
            
            REGLAS CRÍTICAS:
            1. El campo "tema" debe ser un código de Resultado de Aprendizaje presente en el módulo (ej: "RA1", "RA2").
            2. El campo "respuesta_correcta" debe ser el ÍNDICE (0, 1, 2 o 3) del array de opciones.
            3. "dificultad" debe ser un número: 0 (fácil), 1 (medio) o 2 (difícil).
            4. Responde ÚNICAMENTE con un array JSON válido.

            FORMATO DE SALIDA:
            [
                {
                    "enunciado": "La pregunta...",
                    "opciones": ["A", "B", "C", "D"],
                    "respuesta_correcta": 0,
                    "tema": "RA1",
                    "dificultad": 1
                }
            ]
        `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "Eres un generador de exámenes que solo responde en JSON técnico y estructurado." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4o-mini", // O el modelo que prefieras
            temperature: 0.3,
        });

        let textResponse = completion.choices[0].message.content;
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const questions = JSON.parse(textResponse);

        // Añadimos el creador y la asignatura a cada pregunta antes de devolverlas
        return questions.map(q => ({
            ...q,
            asignatura: asignatura,
            creador: "IA_Generator"
        }));

    } catch (error) {
        console.error("❌ Error en aiService:", error);
        throw new Error("No se pudieron generar preguntas: " + error.message);
    }
};