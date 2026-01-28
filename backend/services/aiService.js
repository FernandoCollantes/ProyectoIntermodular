const OpenAI = require('openai');

// ------------------------------------------------------------------
// CONFIGURACIÓN OPENAI
// Pega tu clave que empieza por 'sk-...' aquí abajo.
// (No importa si está vacía mientras MOCK_MODE sea true)
// ------------------------------------------------------------------
const openai = new OpenAI({
    apiKey: "API_KEY"
});

// --- CONFIGURACIÓN DE PRUEBAS ---
const MOCK_MODE = false; // <--- MANTÉN ESTO EN true PARA PROBAR GRATIS

exports.generateQuestionsFromText = async (textContext, curso, asignatura, numQuestions = 5) => {
    try {
        // 1. MODO SIMULACIÓN (GRATIS Y SEGURO)
        if (MOCK_MODE) {
            console.log("⚠️ MODO SIMULACIÓN: Generando preguntas de prueba...");

            // Simular tiempo de espera de la IA (2 segundos) para ver el loading en el frontend
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generar preguntas falsas pero realistas basadas en tus inputs
            return Array.from({ length: numQuestions }, (_, i) => ({
                enunciado: `(IA Simulada) Pregunta ${i + 1} sobre ${asignatura}: ¿Cuál es un concepto clave de ${curso}?`,
                opciones: [
                    "Concepto Correcto Simulado",
                    "Concepto Erróneo A",
                    "Concepto Erróneo B",
                    "Concepto Erróneo C"
                ],
                respuesta_correcta: "Concepto Correcto Simulado",
                dificultad: (i % 3) + 1 // Alterna dificultad 1, 2, 3
            }));
        }

        // 2. MODO REAL (OPENAI) - Solo se ejecuta si MOCK_MODE = false
        console.log("🤖 Conectando con OpenAI (ChatGPT)...");

        // Construcción del Prompt
        const prompt = `
            Actúa como un profesor experto en ${curso} para la asignatura de ${asignatura}.
            Basándote EXCLUSIVAMENTE en el siguiente texto de unos apuntes:
            
            "${textContext.substring(0, 15000)}" 
            
            Genera ${numQuestions} preguntas tipo test.
            
            FORMATO DE RESPUESTA OBLIGATORIO (JSON PURO):
            Devuelve SOLAMENTE un Array de objetos JSON. No uses bloques de código markdown (\`\`\`json).
            Estructura:
            [
                {
                    "enunciado": "Pregunta...",
                    "opciones": ["A", "B", "C", "D"],
                    "respuesta_correcta": "La opción correcta literal",
                    "dificultad": 1
                }
            ]
        `;

        // Petición a la API
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "Eres un asistente que solo habla en JSON válido." },
                { role: "user", content: prompt }
            ],
            model: "gpt-4.1-mini",
            temperature: 0.5, // Creatividad baja para asegurar formato estricto
        });

        let textResponse = completion.choices[0].message.content;
        console.log("📩 Respuesta recibida de OpenAI");

        // Limpieza de seguridad (por si GPT se pone creativo con el formato)
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parseo
        const questions = JSON.parse(textResponse);
        return questions;

    } catch (error) {
        console.error("❌ Error OpenAI:", error);

        // Gestión específica de errores de OpenAI para que sepas qué pasa
        if (error.status === 401) {
            throw new Error("Error de Autenticación: La API Key es incorrecta.");
        }
        if (error.status === 429) {
            throw new Error("Error de Cuota: No tienes créditos suficientes en OpenAI o has excedido el límite.");
        }
        if (error.status === 500 || error.status === 503) {
            throw new Error("Error del Servidor de OpenAI: Están caídos momentáneamente.");
        }

        throw new Error("Fallo al generar preguntas: " + error.message);
    }
};