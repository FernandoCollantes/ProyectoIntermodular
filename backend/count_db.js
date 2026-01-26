const mongoose = require('mongoose');
const Curso = require('./models/Curso');
const Asignatura = require('./models/Asignatura');
const Criterio = require('./models/Criterio');
const Pregunta = require('./models/PreguntaModelo');

const uri = "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

async function count() {
    try {
        await mongoose.connect(uri);
        const nCursos = await Curso.countDocuments();
        const nAsig = await Asignatura.countDocuments();
        const nCrit = await Criterio.countDocuments();
        const nPreg = await Pregunta.countDocuments();

        console.log(`Cursos: ${nCursos}`);
        console.log(`Asignaturas: ${nAsig}`);
        console.log(`Criterios: ${nCrit}`);
        console.log(`Preguntas: ${nPreg}`);
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

count();
