const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "TU_CLAVE_AQUÍ"
});

// Mantén MOCK_MODE en true para probar sin gastar créditos
const MOCK_MODE = true;

exports.generateQuestionsFromText = async (textContext, asignatura, tema, numQuestions = 10, dificultad = 1) => {
    try {
        if (MOCK_MODE) {
            console.log("⚠️ MODO SIMULACIÓN: Generando preguntas de prueba...");
            await new Promise(resolve => setTimeout(resolve, 1500));
            return Array.from({ length: numQuestions }, (_, i) => ({
                enunciado: `(Simulado) Pregunta ${i + 1}: ¿Cuál es un concepto clave de ${asignatura} en relación con ${tema}?`,
                opciones: [
                    `Opción A para la pregunta ${i + 1}`,
                    `Opción B de relleno`,
                    `Opción C incorrecta`,
                    `Opción D de ejemplo`
                ],
                respuesta_correcta: 0,
                tema: tema,
                dificultad: dificultad
            }));
        }

        const prompt = `
            Actúa como un profesor experto en el módulo de "${asignatura}".
            Basándote exclusivamente en el siguiente contenido técnico: "${textContext.substring(0, 10000)}"
            
            Genera exactamente ${numQuestions} pregunta(s) de opción múltiple relacionada(s) con el Resultado de Aprendizaje "${tema}".
            
            REGLAS CRÍTICAS:
            1. El campo "tema" debe ser exactamente "${tema}".
            2. El campo "respuesta_correcta" debe ser el ÍNDICE (0, 1, 2 o 3) del array de opciones.
            3. "dificultad" debe ser exactamente ${dificultad} (0=fácil, 1=medio, 2=difícil). Ajusta el nivel de las preguntas a este valor.
            4. Responde ÚNICAMENTE con un array JSON válido.
            5. La pregunta debe estar directamente relacionada con el contenido del PDF.

            FORMATO DE SALIDA:
            [
                {
                    "enunciado": "La pregunta...",
                    "opciones": ["A", "B", "C", "D"],
                    "respuesta_correcta": 0,
                    "tema": "${tema}",
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