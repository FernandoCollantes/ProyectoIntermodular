require('dotenv').config();
const mongoose = require('mongoose');

// Models
const Asignatura = require('./models/Asignatura');
const ResultadoAprendizaje = require('./models/ResultadoAprendizaje'); // Check import path
const Criterio = require('./models/Criterio');

const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

async function checkData() {
    try {
        console.log("🌱 Conectando...");
        await mongoose.connect(uri);

        console.log("\n--- Asignaturas ---");
        const asigs = await Asignatura.find({});
        asigs.forEach(a => console.log(`ID: "${a._id}", Nombre: "${a.nombre}"`));

        if (asigs.length > 0) {
            const sampleId = asigs[0]._id;
            console.log(`\n--- RAs para ${sampleId} ---`);
            const ras = await ResultadoAprendizaje.find({ asignatura: sampleId });
            ras.forEach(r => console.log(`RA: "${r.nombre}", ID: ${r._id}`));

            if (ras.length > 0) {
                const sampleRaId = ras[0]._id;
                console.log(`\n--- Criterios para RA ${sampleRaId} ---`);
                const crits = await Criterio.find({ resultadoAprendizaje: sampleRaId });
                crits.forEach(c => console.log(`Crit: "${c.nombre}", Desc: "${c.descripcion.substring(0, 20)}..."`));
            } else {
                console.log("No RAs found for this subject.");
            }
        }

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
}

checkData();
