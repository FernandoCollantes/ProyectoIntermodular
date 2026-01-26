require('dotenv').config(); 
const mongoose = require('mongoose');

// Importamos Modelos
const Asignatura = require('./models/Asignatura');
const Criterio = require('./models/Criterio');
const Pregunta = require('./models/PreguntaModelo');
const Examen = require('./models/ExamenModelo');
const Intento = require('./models/Intento');
const Curso = require('./models/Curso');

// URI de conexión
const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

async function seedDatabase() {
    try {
        console.log("🌱 Conectando a MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Conectado.");

        // 1. LIMPIEZA TOTAL
        console.log("🧹 Limpiando base de datos...");
        await Promise.all([
            Asignatura.deleteMany({}),
            Criterio.deleteMany({}),
            Pregunta.deleteMany({}),
            Examen.deleteMany({}),
            Intento.deleteMany({}),
            Curso.deleteMany({})
        ]);
        console.log("✨ Base de datos limpia.");

        // =========================================================
        // 2. DEFINICIÓN DE MÓDULOS (ASIGNATURAS)
        // =========================================================
        console.log("📚 Definiendo catálogo de Módulos (Asignaturas)...");

        // --- 1º CURSO (Común DAM y DAW) ---
        const modulosPrimero = [
            { _id: 'MP0483', nombre: 'Sistemas informáticos' },
            { _id: 'MP0484', nombre: 'Bases de datos' },
            { _id: 'MP0485', nombre: 'Programación' },
            { _id: 'MP0487', nombre: 'Entornos de desarrollo' },
            { _id: 'MP0373', nombre: 'Lenguajes de marcas y sistemas de gestión de información' },
            { _id: 'MP0493', nombre: 'Formación y orientación laboral' }
        ];

        // --- 2º DAM (Multiplataforma) ---
        const modulosDAM2 = [
            { _id: 'MP0486', nombre: 'Acceso a datos' },
            { _id: 'MP0488', nombre: 'Desarrollo de interfaces' },
            { _id: 'MP0489', nombre: 'Programación multimedia y dispositivos móviles' },
            { _id: 'MP0490', nombre: 'Programación de servicios y procesos' },
            { _id: 'MP0491', nombre: 'Sistemas de gestión empresarial' },
            { _id: 'MP0494', nombre: 'Empresa e iniciativa emprendedora' }, // Compartida a veces, pero listamos aquí
            { _id: 'MP0492', nombre: 'Proyecto de desarrollo de aplicaciones multiplataforma' }
            // Omitimos FCT (Formación en Centros de Trabajo) MP0495 porque no tiene exámenes teóricos
        ];

        // --- 2º DAW (Web) ---
        const modulosDAW2 = [
            { _id: 'MP0612', nombre: 'Desarrollo web en entorno cliente' },
            { _id: 'MP0613', nombre: 'Desarrollo web en entorno servidor' },
            { _id: 'MP0614', nombre: 'Despliegue de aplicaciones web' },
            { _id: 'MP0615', nombre: 'Diseño de interfaces web' },
            { _id: 'MP0616', nombre: 'Proyecto de desarrollo de aplicaciones web' }
            // Reutilizamos MP0494 (EIE) que ya está en la lista de DAM2 si es compartida, 
            // o la insertamos si no existe al crear el curso.
        ];

        // Unimos todas para insertarlas en la colección de Asignaturas
        // Usamos un Map para evitar duplicados si MP0494 está en ambas listas conceptuales
        const todasAsignaturas = new Map();
        [...modulosPrimero, ...modulosDAM2, ...modulosDAW2].forEach(a => todasAsignaturas.set(a._id, a));
        
        await Asignatura.insertMany(Array.from(todasAsignaturas.values()));
        console.log(`✅ ${todasAsignaturas.size} Asignaturas insertadas.`);

        // =========================================================
        // 3. CREAR CURSOS Y VINCULAR MÓDULOS
        // =========================================================
        console.log("🎓 Creando Cursos Oficiales...");

        // IDs para 1º (Común)
        const idsPrimero = modulosPrimero.map(m => m._id);

        // IDs para DAM2
        const idsDAM2 = modulosDAM2.map(m => m._id);

        // IDs para DAW2 (Incluyendo EIE MP0494 que definimos arriba)
        const idsDAW2 = [
            'MP0612', 'MP0613', 'MP0614', 'MP0615', 'MP0616', 'MP0494'
        ];

        const cursos = [
            {
                _id: 'DAM1',
                nombre: '1º Desarrollo de Aplicaciones Multiplataforma',
                asignaturas: idsPrimero // Vinculamos las de 1º
            },
            {
                _id: 'DAW1',
                nombre: '1º Desarrollo de Aplicaciones Web',
                asignaturas: idsPrimero // Vinculamos las mismas de 1º (Comparten curso)
            },
            {
                _id: 'DAM2',
                nombre: '2º Desarrollo de Aplicaciones Multiplataforma',
                asignaturas: idsDAM2
            },
            {
                _id: 'DAW2',
                nombre: '2º Desarrollo de Aplicaciones Web',
                asignaturas: idsDAW2
            }
        ];

        await Curso.insertMany(cursos);
        console.log("✅ 4 Cursos creados correctamente.");

        // =========================================================
        // 4. DATOS DE EJEMPLO (Opcional, para que no esté vacío)
        // =========================================================
        // Crearemos un par de criterios y preguntas en una asignatura común
        // para verificar que el sistema funciona nada más arrancar.
        
        /* Si prefieres dejarlo limpio sin preguntas, comenta esta sección.
        Pero es recomendable tener al menos un dato para probar.
        */
        console.log("📝 Generando datos de muestra (Programación)...");
        
        const critPOO = await new Criterio({ 
            nombre: 'Programación Orientada a Objetos', 
            descripcion: 'Conceptos básicos de clases y objetos',
            asignatura: 'MP0485' 
        }).save();

        await Pregunta.insertMany([
            {
                enunciado: "¿Qué palabra clave se usa para heredar en Java?",
                opciones: ["extends", "implements", "inherits", "super"],
                respuesta_correcta: "extends",
                asignatura: 'MP0485',
                criterios_evaluacion: [critPOO._id],
                dificultad: 1
            }
        ]);

        console.log("🏁 Proceso finalizado.");
        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Error en el seed:", error);
        process.exit(1);
    }
}

seedDatabase();