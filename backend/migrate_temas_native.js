require('dotenv').config({ path: './Mongo.env' });
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

async function migrate() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const collection = db.collection('Preguntas');

        // Buscar documentos donde 'tema' sea un string usando el driver nativo
        const cursor = collection.find({ tema: { $type: 'string' } });
        const questions = await cursor.toArray();

        console.log(`Found ${questions.length} questions with string tema`);

        for (const q of questions) {
            console.log(`Migrating question: ${q._id} - Current tema: ${q.tema}`);
            // Usar updateOne nativo para evitar validaciones de esquema
            await collection.updateOne(
                { _id: q._id },
                { $set: { tema: [q.tema] } }
            );
        }

        console.log('Migration completed successfully');
        mongoose.connection.close();
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
