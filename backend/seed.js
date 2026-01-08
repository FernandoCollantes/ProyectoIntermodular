require('dotenv').config(); 
const mongoose = require('mongoose');

// Importamos Modelos
const Asignatura = require('./models/Asignatura');
const Criterio = require('./models/Criterio');
const Pregunta = require('./models/PreguntaModelo');
const Examen = require('./models/ExamenModelo');

// URI de conexión
const uri = process.env.MONGO_URI || "mongodb+srv://andyjan24_db_user:VPrkJ9hQxAwZt6mk@migaz.ekuaaaf.mongodb.net/Examenes?retryWrites=true&w=majority";

async function seedDatabase() {
    try {
        console.log("🌱 Conectando a MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Conectado.");

        // 1. LIMPIEZA TOTAL
        console.log("🧹 Borrando datos antiguos...");
        await Promise.all([
            Asignatura.deleteMany({}),
            Criterio.deleteMany({}),
            Pregunta.deleteMany({}),
            Examen.deleteMany({})
        ]);
        console.log("✨ Base de datos limpia.");

        // ==========================================
        // 2. CREAR ASIGNATURAS (Módulos DAM)
        // ==========================================
        console.log("📚 Creando Asignaturas (Módulos DAM)...");
        
        const asignaturasData = [
            { _id: 'MP0485', nombre: 'Programación' },
            { _id: 'MP0484', nombre: 'Bases de Datos' },
            { _id: 'MP0487', nombre: 'Entornos de Desarrollo' },
            { _id: 'MP0373', nombre: 'Lenguajes de Marcas' },
            { _id: 'MP0486', nombre: 'Acceso a Datos' },
            { _id: 'MP0488', nombre: 'Desarrollo de Interfaces' },
            { _id: 'MP0489', nombre: 'Prog. Multimedia y Disp. Móviles' },
            { _id: 'MP0490', nombre: 'Prog. de Servicios y Procesos' }
        ];

        // Guardamos las asignaturas y creamos un mapa para usarlas fácilmente
        const asignaturasMap = {};
        for (const asig of asignaturasData) {
            const doc = await new Asignatura(asig).save();
            asignaturasMap[asig._id] = doc;
        }

        // ==========================================
        // 3. CREAR CRITERIOS Y PREGUNTAS
        // ==========================================
        console.log("📝 Generando Criterios y Preguntas...");

        const preguntasParaInsertar = [];

        // --- HELPER PARA CREAR CRITERIOS ---
        const crearCriterio = async (nombre, desc, idAsignatura) => {
            const crit = await new Criterio({ nombre, descripcion: desc, asignatura: idAsignatura }).save();
            return crit._id;
        };

        // --------------------------------------------------------------------------------
        // MP0485 - PROGRAMACIÓN
        // --------------------------------------------------------------------------------
        const critProg_Obj = await crearCriterio('POO', 'Programación Orientada a Objetos', 'MP0485');
        const critProg_Arr = await crearCriterio('Estructuras de Datos', 'Arrays y Colecciones', 'MP0485');

        preguntasParaInsertar.push(
            {
                enunciado: "¿Qué pilar de la POO permite que una clase hija utilice métodos de la clase padre?",
                opciones: ["Herencia", "Polimorfismo", "Encapsulamiento", "Abstracción"],
                respuesta_correcta: "Herencia",
                asignatura: 'MP0485',
                criterios_evaluacion: [critProg_Obj],
                dificultad: 1
            },
            {
                enunciado: "En Java, ¿qué colección no permite elementos duplicados?",
                opciones: ["Set", "List", "Map", "ArrayList"],
                respuesta_correcta: "Set",
                asignatura: 'MP0485',
                criterios_evaluacion: [critProg_Arr],
                dificultad: 2
            }
        );

        // --------------------------------------------------------------------------------
        // MP0484 - BASES DE DATOS
        // --------------------------------------------------------------------------------
        const critBD_Norm = await crearCriterio('Diseño Lógico', 'Normalización y Modelo E-R', 'MP0484');
        const critBD_SQL = await crearCriterio('Lenguaje SQL', 'Consultas y Modificación de datos', 'MP0484');

        preguntasParaInsertar.push(
            {
                enunciado: "¿Qué forma normal asegura que no existan dependencias transitivas?",
                opciones: ["Tercera Forma Normal (3FN)", "Primera Forma Normal (1FN)", "Segunda Forma Normal (2FN)", "Forma Normal de Boyce-Codd"],
                respuesta_correcta: "Tercera Forma Normal (3FN)",
                asignatura: 'MP0484',
                criterios_evaluacion: [critBD_Norm],
                dificultad: 3
            },
            {
                enunciado: "¿Qué comando SQL se utiliza para eliminar una tabla completa de la base de datos?",
                opciones: ["DROP TABLE", "DELETE TABLE", "REMOVE TABLE", "TRUNCATE TABLE"],
                respuesta_correcta: "DROP TABLE",
                asignatura: 'MP0484',
                criterios_evaluacion: [critBD_SQL],
                dificultad: 1
            }
        );

        // --------------------------------------------------------------------------------
        // MP0487 - ENTORNOS DE DESARROLLO (AÑADIDO)
        // --------------------------------------------------------------------------------
        const critED_IDE = await crearCriterio('IDEs', 'Entornos Integrados (Eclipse, IntelliJ)', 'MP0487');
        const critED_Git = await crearCriterio('Control de Versiones', 'Git y GitHub', 'MP0487');

        preguntasParaInsertar.push(
            {
                enunciado: "¿Qué comando de Git se usa para descargar un repositorio remoto?",
                opciones: ["git clone", "git pull", "git fetch", "git download"],
                respuesta_correcta: "git clone",
                asignatura: 'MP0487',
                criterios_evaluacion: [critED_Git],
                dificultad: 1
            },
            {
                enunciado: "¿Cuál de las siguientes herramientas NO es un IDE?",
                opciones: ["Git", "Eclipse", "IntelliJ IDEA", "NetBeans"],
                respuesta_correcta: "Git",
                asignatura: 'MP0487',
                criterios_evaluacion: [critED_IDE],
                dificultad: 1
            }
        );

        // --------------------------------------------------------------------------------
        // MP0373 - LENGUAJES DE MARCAS (AÑADIDO)
        // --------------------------------------------------------------------------------
        const critLM_HTML = await crearCriterio('HTML5', 'Estructura web', 'MP0373');
        const critLM_XML = await crearCriterio('XML/XSD', 'Intercambio de datos', 'MP0373');

        preguntasParaInsertar.push(
            {
                enunciado: "¿Qué etiqueta HTML5 define el contenido principal del documento?",
                opciones: ["<main>", "<body>", "<content>", "<section>"],
                respuesta_correcta: "<main>",
                asignatura: 'MP0373',
                criterios_evaluacion: [critLM_HTML],
                dificultad: 1
            },
            {
                enunciado: "¿Qué significa que un XML sea 'bien formado'?",
                opciones: ["Cumple las reglas sintácticas básicas de XML", "Cumple con un DTD o XSD", "No tiene errores lógicos", "Está escrito en inglés"],
                respuesta_correcta: "Cumple las reglas sintácticas básicas de XML",
                asignatura: 'MP0373',
                criterios_evaluacion: [critLM_XML],
                dificultad: 2
            }
        );

        // --------------------------------------------------------------------------------
        // MP0489 - PROG. MULTIMEDIA Y DISP. MÓVILES
        // --------------------------------------------------------------------------------
        const critMov_Ciclo = await crearCriterio('Ciclo de Vida', 'Estados de una Actividad', 'MP0489');
        const critMov_UI = await crearCriterio('Interfaz de Usuario', 'Layouts y Vistas', 'MP0489');

        preguntasParaInsertar.push(
            {
                enunciado: "¿Qué método se llama cuando una Activity en Android se hace visible para el usuario?",
                opciones: ["onStart()", "onCreate()", "onResume()", "onPause()"],
                respuesta_correcta: "onStart()",
                asignatura: 'MP0489',
                criterios_evaluacion: [critMov_Ciclo],
                dificultad: 2
            },
            {
                enunciado: "¿Qué Layout en Android coloca sus elementos hijos en una sola fila o columna?",
                opciones: ["LinearLayout", "RelativeLayout", "ConstraintLayout", "FrameLayout"],
                respuesta_correcta: "LinearLayout",
                asignatura: 'MP0489',
                criterios_evaluacion: [critMov_UI],
                dificultad: 1
            }
        );

        // --------------------------------------------------------------------------------
        // MP0486 - ACCESO A DATOS
        // --------------------------------------------------------------------------------
        const critAD_Ficheros = await crearCriterio('Manejo de Ficheros', 'Clases File, FileReader, etc.', 'MP0486');
        const critAD_ORM = await crearCriterio('ORM Hibernate', 'Mapeo Objeto-Relacional', 'MP0486');

        preguntasParaInsertar.push(
            {
                enunciado: "¿Qué clase de Java se utiliza para leer caracteres de un fichero de texto?",
                opciones: ["FileReader", "FileInputStream", "File", "BufferedWriter"],
                respuesta_correcta: "FileReader",
                asignatura: 'MP0486',
                criterios_evaluacion: [critAD_Ficheros],
                dificultad: 2
            },
            {
                enunciado: "En Hibernate, ¿qué archivo se usa comúnmente para configurar la conexión a la base de datos?",
                opciones: ["hibernate.cfg.xml", "persistence.xml", "config.properties", "database.xml"],
                respuesta_correcta: "hibernate.cfg.xml",
                asignatura: 'MP0486',
                criterios_evaluacion: [critAD_ORM],
                dificultad: 2
            }
        );

        // --------------------------------------------------------------------------------
        // MP0488 - DESARROLLO DE INTERFACES
        // --------------------------------------------------------------------------------
        const critDI_Usab = await crearCriterio('Usabilidad', 'Diseño centrado en el usuario', 'MP0488');
        const critDI_Comp = await crearCriterio('Componentes Gráficos', 'JavaFX / Swing', 'MP0488');

        preguntasParaInsertar.push(
            {
                enunciado: "¿Qué principio de usabilidad sugiere que el sistema debe hablar el lenguaje del usuario?",
                opciones: ["Coincidencia entre el sistema y el mundo real", "Visibilidad del estado del sistema", "Control y libertad del usuario", "Consistencia y estándares"],
                respuesta_correcta: "Coincidencia entre el sistema y el mundo real",
                asignatura: 'MP0488',
                criterios_evaluacion: [critDI_Usab],
                dificultad: 2
            },
            {
                enunciado: "¿Qué archivo se utiliza en JavaFX para definir la estructura de la interfaz gráfica?",
                opciones: [".fxml", ".xml", ".java", ".css"],
                respuesta_correcta: ".fxml",
                asignatura: 'MP0488',
                criterios_evaluacion: [critDI_Comp],
                dificultad: 1
            }
        );

        // --------------------------------------------------------------------------------
        // MP0490 - PROG. DE SERVICIOS Y PROCESOS (AÑADIDO)
        // --------------------------------------------------------------------------------
        const critPSP_Hilos = await crearCriterio('Multihilo', 'Clase Thread y Runnable', 'MP0490');
        const critPSP_Sockets = await crearCriterio('Comunicaciones en Red', 'Sockets TCP/UDP', 'MP0490');

        preguntasParaInsertar.push(
            {
                enunciado: "¿Qué método de la clase Thread se utiliza para iniciar la ejecución de un hilo?",
                opciones: ["start()", "run()", "init()", "execute()"],
                respuesta_correcta: "start()",
                asignatura: 'MP0490',
                criterios_evaluacion: [critPSP_Hilos],
                dificultad: 2
            },
            {
                enunciado: "¿Qué clase se utiliza en Java para crear un servidor TCP?",
                opciones: ["ServerSocket", "Socket", "DatagramSocket", "TcpListener"],
                respuesta_correcta: "ServerSocket",
                asignatura: 'MP0490',
                criterios_evaluacion: [critPSP_Sockets],
                dificultad: 2
            }
        );

        // 4. INSERTAR TODAS LAS PREGUNTAS
        await Pregunta.insertMany(preguntasParaInsertar);
        
        console.log(`✅ ¡Éxito! Se han insertado ${preguntasParaInsertar.length} preguntas de DAM.`);
        console.log("👋 Cerrando conexión...");
        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("❌ Error en el seed:", error);
        process.exit(1);
    }
}

seedDatabase();