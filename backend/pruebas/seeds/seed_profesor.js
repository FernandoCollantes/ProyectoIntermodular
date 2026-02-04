require('dotenv').config({ path: require('path').join(__dirname, 'Mongo.env') });
const mongoose = require('mongoose');
const Profesor = require('./models/Profesor');
const { connect } = require('./dataBase.js');

async function seedProfesor() {
    try {
        console.log("🌱 Conectando a MongoDB para sembrar profesor...");
        await connect();

        const email = 'fernandocollantes.24@campuscamara.es';
        const teacherData = {
            nombre: 'Fernando Collantes',
            email: email,
            password: 'ExamGen'
        };

        // Upsert: actualizar si existe, crear si no
        await Profesor.findOneAndUpdate(
            { email: email },
            teacherData,
            { upsert: true, new: true }
        );

        console.log(`✅ Profesor sembrado/actualizado: ${email}`);
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error al sembrar profesor:", error);
        process.exit(1);
    }
}

seedProfesor();
