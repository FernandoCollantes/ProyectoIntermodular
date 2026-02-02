require('dotenv').config({ path: './Mongo.env' });
const mongoose = require('mongoose');
const Pregunta = require('./models/PreguntaModelo');
const uri = process.env.MONGO_URI;

async function migrate() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // Buscar preguntas donde 'tema' sea de tipo string
        const questions = await Pregunta.find({ tema: { $type: 'string' } });
        console.log(`Found ${questions.length} questions with string tema`);

        for (const q of questions) {
            console.log(`Migrating question: ${q._id} - Current tema: ${q.tema}`);
            q.tema = [q.tema];
            await q.save();
        }

        console.log('Migration completed successfully');
        mongoose.connection.close();
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
