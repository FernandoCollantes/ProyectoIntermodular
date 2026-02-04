// require('dotenv').config();
// const mongoose = require('mongoose');
// const Curso = require('./models/Curso');
// const Asignatura = require('./models/Asignatura');

// const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

// // Mapeo de asignaturas que deben intercambiarse
// const SWAPS = {
//     // Big Data subjects (should be in Videojuegos course)
//     'MP5073': 'VIDEOJUEGOS',  // Sistemas de aprendizaje automático
//     'MP5072': 'VIDEOJUEGOS',  // Programación de inteligencia artificial
//     'MP5074': 'VIDEOJUEGOS',  // Sistemas de Big Data
//     'MP5075': 'VIDEOJUEGOS',  // Big Data aplicado

//     // Videojuegos subjects (should be in Big Data course)
//     'MP5050': 'BIGDATA',  // Diseño gráfico 2D y 3D
//     'MP5051': 'BIGDATA',  // Realidad virtual y realidad aumentada
//     'MP5052': 'BIGDATA',  // Diseño, gestión, publicación y producción
//     'MP5053': 'BIGDATA',  // Programación en red e inteligencia artificial
// };

// async function swapSubjects() {
//     try {
//         console.log("🔧 Conectando a MongoDB...");
//         await mongoose.connect(uri);
//         console.log("✅ Conectado.\n");

//         // 1. Mostrar estado actual
//         console.log("📋 ESTADO ACTUAL:");
//         const cursos = await Curso.find().populate('asignaturas').sort({ _id: 1 });
//         cursos.forEach(c => {
//             if (c._id.includes('ADFI') || c._id.includes('DESA')) {
//                 console.log(`\n${c.nombre} (${c._id}):`);
//                 c.asignaturas.forEach(a => console.log(`  - ${a.nombre} (${a._id})`));
//             }
//         });

//         // 2. Encontrar los cursos de Big Data y Videojuegos
//         const bigDataCurso = await Curso.findOne({ _id: /ADFI/ });
//         const videojuegosCurso = await Curso.findOne({ _id: /DESA/ });

//         if (!bigDataCurso || !videojuegosCurso) {
//             console.log('\n❌ No se encontraron los cursos de Big Data o Videojuegos');
//             console.log('Big Data curso:', bigDataCurso ? bigDataCurso._id : 'NO ENCONTRADO');
//             console.log('Videojuegos curso:', videojuegosCurso ? videojuegosCurso._id : 'NO ENCONTRADO');
//             mongoose.disconnect();
//             return;
//         }

//         console.log(`\n🎯 Cursos identificados:`);
//         console.log(`  Big Data: ${bigDataCurso._id} - ${bigDataCurso.nombre}`);
//         console.log(`  Videojuegos: ${videojuegosCurso._id} - ${videojuegosCurso.nombre}`);

//         // 3. Realizar el intercambio
//         console.log('\n🔄 Intercambiando asignaturas...');

//         const bigDataAsignaturas = [];
//         const videojuegosAsignaturas = [];

//         // Clasificar asignaturas según el mapeo
//         for (const [asigId, targetCurso] of Object.entries(SWAPS)) {
//             const asig = await Asignatura.findById(asigId);
//             if (asig) {
//                 if (targetCurso === 'BIGDATA') {
//                     bigDataAsignaturas.push(asigId);
//                     console.log(`  ✓ ${asig.nombre} → Big Data`);
//                 } else {
//                     videojuegosAsignaturas.push(asigId);
//                     console.log(`  ✓ ${asig.nombre} → Videojuegos`);
//                 }
//             } else {
//                 console.log(`  ⚠️  Asignatura ${asigId} no encontrada`);
//             }
//         }

//         // 4. Actualizar los cursos
//         console.log('\n💾 Actualizando cursos...');

//         // Remover las asignaturas intercambiadas de ambos cursos
//         await Curso.updateOne(
//             { _id: bigDataCurso._id },
//             { $pull: { asignaturas: { $in: Object.keys(SWAPS) } } }
//         );
//         await Curso.updateOne(
//             { _id: videojuegosCurso._id },
//             { $pull: { asignaturas: { $in: Object.keys(SWAPS) } } }
//         );

//         // Agregar las asignaturas a sus cursos correctos
//         await Curso.updateOne(
//             { _id: bigDataCurso._id },
//             { $addToSet: { asignaturas: { $each: bigDataAsignaturas } } }
//         );
//         await Curso.updateOne(
//             { _id: videojuegosCurso._id },
//             { $addToSet: { asignaturas: { $each: videojuegosAsignaturas } } }
//         );

//         console.log('✅ Cursos actualizados');

//         // 5. Verificar el resultado
//         console.log('\n📋 ESTADO FINAL:');
//         const cursosFinales = await Curso.find().populate('asignaturas').sort({ _id: 1 });
//         cursosFinales.forEach(c => {
//             if (c._id.includes('ADFI') || c._id.includes('DESA')) {
//                 console.log(`\n${c.nombre} (${c._id}):`);
//                 c.asignaturas.forEach(a => console.log(`  - ${a.nombre} (${a._id})`));
//             }
//         });

//         mongoose.disconnect();
//         console.log("\n🏁 Proceso completado.");
//         process.exit(0);

//     } catch (error) {
//         console.error("❌ Error:", error);
//         mongoose.disconnect();
//         process.exit(1);
//     }
// }

// swapSubjects();
