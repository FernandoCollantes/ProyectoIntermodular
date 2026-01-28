require('dotenv').config();
const mongoose = require('mongoose');
const ResultadoAprendizaje = require('./models/ResultadoAprendizaje');
const Criterio = require('./models/Criterio');

const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

async function fixInvalidRAs() {
    try {
        console.log("🔧 Conectando a MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Conectado.\n");

        // 1. Encontrar RAs inválidos (sin nombre o nombre vacío)
        console.log("🔍 Buscando ResultadosAprendizaje inválidos...");
        const invalidRAs = await ResultadoAprendizaje.find({
            $or: [
                { nombre: { $exists: false } },
                { nombre: null },
                { nombre: "" },
                { nombre: /^\s*$/ } // Solo espacios en blanco
            ]
        });

        console.log(`❌ Encontrados ${invalidRAs.length} RAs inválidos.`);

        if (invalidRAs.length === 0) {
            console.log("✨ No hay RAs inválidos para limpiar.");
            mongoose.disconnect();
            return;
        }

        // 2. Obtener los IDs de los RAs inválidos
        const invalidRAIds = invalidRAs.map(ra => ra._id);
        console.log(`\n📋 IDs de RAs inválidos (primeros 10):`, invalidRAIds.slice(0, 10));

        // 3. Encontrar criterios que referencian estos RAs inválidos
        const affectedCriterios = await Criterio.find({
            resultadoAprendizaje: { $in: invalidRAIds }
        });

        console.log(`⚠️  ${affectedCriterios.length} Criterios están vinculados a RAs inválidos.`);

        // 4. Eliminar los criterios huérfanos
        if (affectedCriterios.length > 0) {
            console.log("🗑️  Eliminando Criterios huérfanos...");
            const deletedCriterios = await Criterio.deleteMany({
                resultadoAprendizaje: { $in: invalidRAIds }
            });
            console.log(`✅ ${deletedCriterios.deletedCount} Criterios eliminados.`);
        }

        // 5. Eliminar los RAs inválidos usando operación directa de MongoDB
        console.log("\n🗑️  Eliminando ResultadosAprendizaje inválidos...");
        const deletedRAs = await ResultadoAprendizaje.deleteMany({
            $or: [
                { nombre: { $exists: false } },
                { nombre: null },
                { nombre: "" },
                { nombre: /^\s*$/ }
            ]
        });
        console.log(`✅ ${deletedRAs.deletedCount} RAs inválidos eliminados.`);

        // 6. Verificar el resultado
        console.log("\n🔍 Verificando limpieza...");
        const remainingInvalid = await ResultadoAprendizaje.find({
            $or: [
                { nombre: { $exists: false } },
                { nombre: null },
                { nombre: "" },
                { nombre: /^\s*$/ }
            ]
        });

        if (remainingInvalid.length === 0) {
            console.log("✨ ¡Base de datos limpia! No quedan RAs inválidos.");
        } else {
            console.log(`⚠️  Aún quedan ${remainingInvalid.length} RAs inválidos.`);
        }

        // 7. Mostrar estadísticas finales
        const totalRAs = await ResultadoAprendizaje.countDocuments();
        const totalCriterios = await Criterio.countDocuments();
        console.log(`\n📊 Estadísticas finales:`);
        console.log(`   - Total RAs válidos: ${totalRAs}`);
        console.log(`   - Total Criterios: ${totalCriterios}`);

        mongoose.disconnect();
        console.log("\n🏁 Proceso completado.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        mongoose.disconnect();
        process.exit(1);
    }
}

fixInvalidRAs();
