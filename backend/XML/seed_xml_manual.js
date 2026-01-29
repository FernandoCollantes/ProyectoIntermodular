require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Solo necesitamos estos modelos ahora
const ResultadoAprendizaje = require('../models/ResultadoAprendizaje');

// Tu URI de Atlas
const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

const XML_FILE = 'DAMyDAW.xml';

async function seedDatabase() {
    try {
        console.log("🌱 Conectando a MongoDB Atlas...");
        await mongoose.connect(uri);
        console.log("✅ Conectado.");

        const filePath = path.join(__dirname, XML_FILE);
        if (!fs.existsSync(filePath)) {
            throw new Error(`El archivo ${XML_FILE} no existe en ${__dirname}`);
        }

        console.log(`📂 Leyendo ${XML_FILE}...`);
        const xmlContent = fs.readFileSync(filePath, 'utf-8');

        // Regex mejorada para capturar Modulos y RAs
        const modulosRegex = /<Modulo\s+nombre="([^"]+)">([\s\S]*?)<\/Modulo>/g;
        const raRegex = /<RA\s+codigo="([^"]+)">([\s\S]*?)<\/RA>/g;

        let stats = { modulosProcesados: 0, rasInsertados: 0 };

        // 1. LIMPIEZA: Borramos los RAs antiguos para no duplicar
        console.log("🗑️ Limpiando Resultados de Aprendizaje antiguos...");
        await ResultadoAprendizaje.deleteMany({});

        console.log("🔍 Procesando Módulos del XML...");
        const modMatches = [...xmlContent.matchAll(modulosRegex)];

        for (const mMatch of modMatches) {
            const nombreModulo = mMatch[1];
            const contentAsig = mMatch[2];

            console.log(`\n📘 Módulo: "${nombreModulo}"`);
            stats.modulosProcesados++;

            const raMatches = [...contentAsig.matchAll(raRegex)];

            for (const rMatch of raMatches) {
                const raCodigo = rMatch[1];
                const raTexto = rMatch[2].trim();

                // Guardamos directamente el RA vinculado al NOMBRE del módulo
                await ResultadoAprendizaje.create({
                    codigo: raCodigo,      // ej: "RA1"
                    texto: raTexto,       // El enunciado largo
                    asignatura: nombreModulo // El nombre del módulo (String)
                });
                stats.rasInsertados++;
            }
        }

        console.log("\n✅ ¡MIGRACIÓN COMPLETADA!");
        console.log("------------------------------------------------");
        console.log(`Módulos leídos:       ${stats.modulosProcesados}`);
        console.log(`RAs creados:          ${stats.rasInsertados}`);
        console.log("------------------------------------------------");
        console.log("🚀 El sistema ya está listo para el nuevo XML.");

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Error en la semilla:", error);
        process.exit(1);
    }
}

seedDatabase();