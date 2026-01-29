// require('dotenv').config();
// const mongoose = require('mongoose');

// // Importamos Modelos
// const Asignatura = require('./models/Asignatura');
// const ResultadoAprendizaje = require('./models/ResultadoAprendizaje');
// const Criterio = require('./models/Criterio');
// const Pregunta = require('./models/PreguntaModelo');

// // URI de conexión
// const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

// async function seedQuestions() {
//     try {
//         console.log("🌱 Conectando a MongoDB...");
//         await mongoose.connect(uri);
//         console.log("✅ Conectado.");

//         // 1. Obtener todos los RAs
//         const ras = await ResultadoAprendizaje.find();
//         console.log(`🔍 Encontrados ${ras.length} Resultados de Aprendizaje.`);

//         const nuevasPreguntas = [];

//         for (const ra of ras) {
//             // 2. Obtener criterios del RA
//             const criterios = await Criterio.find({ resultadoAprendizaje: ra._id });

//             if (criterios.length === 0) {
//                 console.log(`⚠️ RA "${ra.nombre}" (${ra._id}) no tiene criterios asociados. Saltando...`);
//                 continue;
//             }

//             // 3. Generar enunciado basado en descripciones
//             // Usamos la descripción del RA y del primer criterio para dar contexto
//             const contextRA = ra.descripcion || ra.nombre;
//             const contextCrit = criterios[0].descripcion || criterios[0].nombre;

//             const enunciado = `Teniendo en cuenta que el objetivo es "${contextRA}", ¿cuál de las siguientes afirmaciones se relaciona correctamente con el criterio: "${contextCrit}"?`;

//             // 4. Crear la pregunta
//             nuevasPreguntas.push({
//                 enunciado: enunciado,
//                 opciones: [
//                     "Es una práctica fundamental para cumplir los estándares establecidos.",
//                     "No es relevante para los objetivos del módulo.",
//                     "Solo se aplica en situaciones excepcionales.",
//                     "Es una recomendación opcional según el contexto."
//                 ],
//                 respuesta_correcta: "Es una práctica fundamental para cumplir los estándares establecidos.",
//                 asignatura: ra.asignatura,
//                 criterios_evaluacion: criterios.map(c => c._id),
//                 dificultad: Math.floor(Math.random() * 5) + 3 // Dificultad entre 3 y 8
//             });
//         }

//         // 5. Insertar preguntas
//         if (nuevasPreguntas.length > 0) {
//             console.log(`📝 Insertando ${nuevasPreguntas.length} nuevas preguntas...`);
//             await Pregunta.insertMany(nuevasPreguntas);
//             console.log("✅ Preguntas insertadas exitosamente.");
//         } else {
//             console.log("ℹ️ No se generaron nuevas preguntas.");
//         }

//         mongoose.connection.close();
//         process.exit(0);

//     } catch (error) {
//         console.error("❌ Error en el seed de preguntas:", error);
//         process.exit(1);
//     }
// }

// seedQuestions();
