require('dotenv').config({ path: './Mongo.env' });
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

async function migrate() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const collection = db.collection('Preguntas');

        const cursor = collection.find({});
        const questions = await cursor.toArray();

        console.log(`Processing ${questions.length} questions`);

        for (const q of questions) {
            let currentTema = q.tema;
            let normalizedTema = [];

            function flatten(item) {
                if (Array.isArray(item)) {
                    item.forEach(flatten);
                } else if (typeof item === 'string') {
                    // Split by comma in case someone saved it as "RA1,RA2"
                    item.split(',').forEach(s => {
                        const trimmed = s.trim();
                        if (trimmed && !normalizedTema.includes(trimmed)) {
                            normalizedTema.push(trimmed);
                        }
                    });
                }
            }

            flatten(currentTema);

            console.log(`Migrating question: ${q._id}`);
            console.log(`  From: ${JSON.stringify(currentTema)}`);
            console.log(`  To:   ${JSON.stringify(normalizedTema)}`);

            await collection.updateOne(
                { _id: q._id },
                { $set: { tema: normalizedTema } }
            );
        }

        console.log('Deep Flatten Migration completed successfully');
        mongoose.connection.close();
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
