require('dotenv').config();
const mongoose = require('mongoose');
const Curso = require('./models/Curso');
const Asignatura = require('./models/Asignatura');

const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

async function check() {
    try {
        await mongoose.connect(uri);
        // console.log("Connected");

        const cursos = await Curso.find().populate('asignaturas');
        console.log(JSON.stringify(cursos, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

check();
