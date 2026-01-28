require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Importamos Modelos
const Curso = require('./models/Curso');
const Asignatura = require('./models/Asignatura');
const ResultadoAprendizaje = require('./models/ResultadoAprendizaje');
const Criterio = require('./models/Criterio');
const Pregunta = require('./models/PreguntaModelo');
const Examen = require('./models/ExamenModelo');

// URI de conexión
const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

// Archivo XML a procesar
const XML_FILE = 'XML/BigData.Admin.Videojuegos.xml';

async function seedDatabase() {
    try {
        console.log("🌱 Conectando a MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Conectado.");

        // 1. LIMPIEZA TOTAL
        console.log("🧹 Borrando todos los datos antiguos...");
        await Promise.all([
            Curso.deleteMany({}),
            Asignatura.deleteMany({}),
            ResultadoAprendizaje.deleteMany({}),
            Criterio.deleteMany({}),
            Pregunta.deleteMany({}),
            Examen.deleteMany({})
        ]);
        console.log("✨ Base de datos limpia.");

        // 2. LEER XML
        const filePath = path.join(__dirname, XML_FILE);
        if (!fs.existsSync(filePath)) {
            throw new Error(`El archivo ${XML_FILE} no existe.`);
        }
        console.log(`📂 Leyendo ${XML_FILE}...`);
        const xmlContent = fs.readFileSync(filePath, 'utf-8');

        // --- PARSER MANUAL (REGEX) ---
        const getAttr = (tag, attr) => {
            const regex = new RegExp(`${attr}="([^"]+)"`);
            const match = tag.match(regex);
            return match ? match[1] : null;
        };

        const titulosRegex = /<Titulo([\s\S]*?)>([\s\S]*?)<\/Titulo>/g;
        const modulosRegex = /<Modulo([\s\S]*?)>([\s\S]*?)<\/Modulo>/g;
        const raRegex = /<Resultado_de_Aprendizaje([\s\S]*?)>([\s\S]*?)<\/Resultado_de_Aprendizaje>/g;
        const criteriosRegex = /<Criterio_de_Evaluacion([\s\S]*?)(\/?>|<\/Criterio_de_Evaluacion>)/g;

        let stats = { asig: 0, cur: 0, ra: 0, crit: 0, preg: 0 };

        const titulosMatches = [...xmlContent.matchAll(titulosRegex)];

        for (const tMatch of titulosMatches) {
            const tAttrs = tMatch[1];
            const tContent = tMatch[2];
            const nombreTitulo = getAttr(tAttrs, 'nombre');
            const codigoBase = generarCodigoBase(nombreTitulo);

            const modMatches = [...tContent.matchAll(modulosRegex)];
            for (const mMatch of modMatches) {
                const mAttrs = mMatch[1];
                const mContent = mMatch[2];

                const codAsig = getAttr(mAttrs, 'cod');
                const nombreAsig = getAttr(mAttrs, 'nombre');
                const cursoStr = getAttr(mAttrs, 'curso');

                if (!codAsig || !nombreAsig) continue;

                const idAsignatura = `MP${codAsig}`;
                const asigDoc = await Asignatura.findOneAndUpdate(
                    { _id: idAsignatura },
                    { $setOnInsert: { nombre: nombreAsig } },
                    { upsert: true, new: true }
                );
                if (asigDoc.isNew) stats.asig++;

                // Gestionar Curso
                const numCurso = cursoStr && cursoStr.includes('2') ? '2' : '1';
                const idCurso = `${codigoBase}${numCurso}`;
                await Curso.findOneAndUpdate(
                    { _id: idCurso },
                    {
                        $setOnInsert: { nombre: `${numCurso}º ${nombreTitulo}` },
                        $addToSet: { asignaturas: idAsignatura }
                    },
                    { upsert: true }
                );
                stats.cur++;

                // Resultados de Aprendizaje
                const raMatches = [...mContent.matchAll(raRegex)];
                for (const raMatch of raMatches) {
                    const raAttrs = raMatch[1];
                    const raContent = raMatch[2];
                    const codRA = getAttr(raAttrs, 'cod');
                    const descRA = getAttr(raAttrs, 'nombre');

                    const raDoc = new ResultadoAprendizaje({
                        nombre: `RA${codRA}`,
                        descripcion: descRA,
                        asignatura: idAsignatura
                    });
                    await raDoc.save();
                    stats.ra++;

                    // Criterios
                    const critMatches = [...raContent.matchAll(criteriosRegex)];
                    for (const cMatch of critMatches) {
                        const cAttrs = cMatch[1];
                        const codCrit = getAttr(cAttrs, 'cod');
                        const nombreCrit = getAttr(cAttrs, 'nombre');

                        if (!nombreCrit) continue;

                        const nuevoCriterio = new Criterio({
                            nombre: `CE${codCrit}`,
                            descripcion: nombreCrit,
                            resultadoAprendizaje: raDoc._id
                        });
                        await nuevoCriterio.save();
                        stats.crit++;

                        // Pregunta de ejemplo
                        await Pregunta.create({
                            enunciado: `¿Se cumple el criterio "${nombreCrit.substring(0, 50)}..." en el contexto de ${raDoc.nombre}?`,
                            opciones: ["Sí", "No", "Parcialmente", "No evaluado"],
                            respuesta_correcta: "Sí",
                            asignatura: idAsignatura,
                            criterios_evaluacion: [nuevoCriterio._id],
                            dificultad: 1
                        });
                        stats.preg++;
                    }
                }
            }
        }

        console.log("\n✅ ¡POBLACIÓN COMPLETADA!");
        console.log(`Cursos: ${stats.cur}, Módulos: ${stats.asig}, RAs: ${stats.ra}, Criterios: ${stats.crit}, Preguntas: ${stats.preg}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

function generarCodigoBase(texto) {
    const limpio = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const palabras = limpio.split(' ').filter(p => p.length > 2 && p !== "CICLO" && p !== "GRADO" && p !== "SUPERIOR" && p !== "MEDIO");
    return palabras.length >= 2 ? palabras[0].substring(0, 2) + palabras[1].substring(0, 2) : limpio.substring(0, 4);
}

seedDatabase();