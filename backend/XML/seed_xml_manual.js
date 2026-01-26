require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Importamos Modelos
const Asignatura = require('../models/Asignatura');
const Criterio = require('../models/Criterio');
const Pregunta = require('../models/PreguntaModelo');
const Curso = require('../models/Curso');

// URI de conexión
const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

// Archivo XML a procesar
const XML_FILE = 'BigData.Admin.Videojuegos.xml';

async function seedDatabase() {
    try {
        console.log("🌱 Conectando a MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Conectado.");

        // NOTA: Se ha eliminado la sección de limpieza (deleteMany)

        // 1. LEER XML
        const filePath = path.join(__dirname, XML_FILE);
        if (!fs.existsSync(filePath)) {
            throw new Error(`El archivo ${XML_FILE} no existe en la raíz.`);
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
        const criteriosRegex = /<Criterio_de_Evaluacion([\s\S]*?)(\/?>|<\/Criterio_de_Evaluacion>)/g;

        // Contadores para el resumen final
        let stats = { asig: 0, cur: 0, crit: 0, preg: 0 };

        // Procesar Títulos
        const titulosMatches = [...xmlContent.matchAll(titulosRegex)];
        console.log(`🔍 Procesando ${titulosMatches.length} Títulos del XML...`);

        for (const tMatch of titulosMatches) {
            const tAttrs = tMatch[1];
            const tContent = tMatch[2];
            const nombreTitulo = getAttr(tAttrs, 'nombre');
            
            console.log(`\n🎓 Título: ${nombreTitulo}`);
            const codigoBase = generarCodigoBase(nombreTitulo);

            // Procesar Módulos (Asignaturas)
            const modMatches = [...tContent.matchAll(modulosRegex)];
            
            for (const mMatch of modMatches) {
                const mAttrs = mMatch[1];
                const mContent = mMatch[2];
                
                const codAsig = getAttr(mAttrs, 'cod');
                const nombreAsig = getAttr(mAttrs, 'nombre');
                const cursoStr = getAttr(mAttrs, 'curso');

                if (!codAsig || !nombreAsig) continue;

                const idAsignatura = `MP${codAsig}`;
                
                // 1. GESTIONAR ASIGNATURA (Upsert: Crea si no existe)
                // Usamos findOneAndUpdate con upsert para asegurar que existe sin duplicar
                const asigDoc = await Asignatura.findOneAndUpdate(
                    { _id: idAsignatura },
                    { $setOnInsert: { nombre: nombreAsig } }, // Solo pone nombre si es nueva
                    { upsert: true, new: true }
                );
                if (asigDoc.isNew) {
                    console.log(`   [Nueva Asignatura] ${idAsignatura}: ${nombreAsig}`);
                    stats.asig++;
                }

                // 2. GESTIONAR CURSO
                const numCurso = cursoStr && cursoStr.includes('2') ? '2' : '1';
                const idCurso = `${codigoBase}${numCurso}`;
                const nombreCurso = `${numCurso}º ${nombreTitulo}`;

                // Buscamos curso, si no existe lo creamos, y añadimos la asignatura al array (sin duplicar)
                const cursoDoc = await Curso.findOneAndUpdate(
                    { _id: idCurso },
                    { 
                        $setOnInsert: { nombre: nombreCurso },
                        $addToSet: { asignaturas: idAsignatura } // Solo añade si no está ya
                    },
                    { upsert: true, new: true }
                );
                
                // Si el curso ya existía pero le acabamos de meter una asignatura nueva, lo actualizamos
                if (!cursoDoc.isNew) {
                    await Curso.updateOne(
                        { _id: idCurso },
                        { $addToSet: { asignaturas: idAsignatura } }
                    );
                } else {
                    console.log(`   [Nuevo Curso] ${idCurso}`);
                    stats.cur++;
                }

                // 3. GESTIONAR CRITERIOS
                const critMatches = [...mContent.matchAll(criteriosRegex)];
                
                for (const cMatch of critMatches) {
                    const cAttrs = cMatch[1];
                    const codCrit = getAttr(cAttrs, 'cod');
                    const nombreCrit = getAttr(cAttrs, 'nombre');

                    if (!nombreCrit) continue;

                    // Nombre único para búsqueda (evitar duplicados de contenido)
                    // Usamos una clave compuesta lógica: (asignatura + código_criterio)
                    // Nota: Como 'nombre' puede variar, mejor confiamos en la combinación Asignatura + Descripción parcial o código.
                    // Para simplificar y ser robustos: Buscamos si existe un criterio con ese nombre exacto en esa asignatura.
                    
                    const criterioExistente = await Criterio.findOne({
                        asignatura: idAsignatura,
                        // Usamos regex para coincidencia laxa o string exacto. 
                        // El XML puede tener espacios extra, así que limpiamos.
                        nombre: { $regex: new RegExp(`^Criterio ${codCrit}`, 'i') } 
                    });

                    if (!criterioExistente) {
                        const nuevoCriterio = new Criterio({
                            nombre: `Criterio ${codCrit}`,
                            descripcion: nombreCrit.substring(0, 300), 
                            asignatura: idAsignatura
                        });
                        await nuevoCriterio.save();
                        stats.crit++;

                        // Generar Pregunta SOLO si el criterio es nuevo (para no duplicar preguntas)
                        await Pregunta.create({
                            enunciado: `En el contexto de ${nombreAsig}, evalúe: "${nombreCrit.substring(0, 100)}..."`,
                            opciones: ["Correcto", "Incorrecto", "No aplica", "Depende"],
                            respuesta_correcta: "Correcto",
                            asignatura: idAsignatura,
                            criterios_evaluacion: [nuevoCriterio._id],
                            dificultad: 1
                        });
                        stats.preg++;
                    }
                }
            }
        }

        console.log("\n✅ ¡PROCESO COMPLETADO!");
        console.log("------------------------------------------------");
        console.log(`Nuevas Asignaturas: ${stats.asig}`);
        console.log(`Nuevos Cursos:      ${stats.cur}`);
        console.log(`Nuevos Criterios:   ${stats.crit}`);
        console.log(`Nuevas Preguntas:   ${stats.preg}`);
        console.log("------------------------------------------------");

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
    
    if (palabras.length >= 2) {
        // Ej: Admin y Finanzas -> ADFI
        return palabras[0].substring(0, 2) + palabras[1].substring(0, 2);
    }
    return limpio.substring(0, 4);
}

seedDatabase();