require('dotenv').config();
const mongoose = require('mongoose');
const Curso = require('./models/Curso');
const Asignatura = require('./models/Asignatura');

const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

async function checkCourses() {
    try {
        await mongoose.connect(uri);

        console.log('=== CURSOS Y SUS ASIGNATURAS ===\n');
        const cursos = await Curso.find().populate('asignaturas').sort({ _id: 1 });

        cursos.forEach(c => {
            console.log(`${c.nombre} (${c._id}):`);
            c.asignaturas.forEach(a => console.log(`  - ${a.nombre} (${a._id})`));
            console.log('');
        });

        console.log('\n=== BUSCANDO BIG DATA Y VIDEOJUEGOS ===\n');
        const bigData = await Asignatura.findOne({ nombre: /big data/i });
        const videojuegos = await Asignatura.findOne({ nombre: /videojuego/i });

        if (bigData) {
            console.log('✓ Big Data encontrado:', bigData._id, '-', bigData.nombre);
            const cursosConBigData = await Curso.find({ asignaturas: bigData._id });
            console.log('  Está en los cursos:', cursosConBigData.map(c => c.nombre).join(', '));
        } else {
            console.log('✗ Big Data NO encontrado');
        }

        if (videojuegos) {
            console.log('✓ Videojuegos encontrado:', videojuegos._id, '-', videojuegos.nombre);
            const cursosConVideojuegos = await Curso.find({ asignaturas: videojuegos._id });
            console.log('  Está en los cursos:', cursosConVideojuegos.map(c => c.nombre).join(', '));
        } else {
            console.log('✗ Videojuegos NO encontrado');
        }

        mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        mongoose.disconnect();
        process.exit(1);
    }
}

checkCourses();
