// Datos de prueba para usar en los tests

module.exports = {
    // Profesor de prueba
    testProfesor: {
        nombre: 'Juan Pérez García',
        email: 'juan.perez@test.com',
        password: 'test123456'
    },

    // Profesor adicional
    testProfesor2: {
        nombre: 'María López Sánchez',
        email: 'maria.lopez@test.com',
        password: 'test789'
    },

    // Asignatura de prueba
    testAsignatura: {
        nombre: 'Big Data',
        codigo: 'BD'
    },

    // Resultado de Aprendizaje de prueba
    testRA: {
        codigo: 'RA1',
        texto: 'Identifica los sistemas de almacenamiento analizando sus características, elementos y funciones.',
        asignatura: 'Big Data',
        criterios: [
            {
                codigo: 'a',
                texto: 'Se han reconocido las diferentes tecnologías de almacenamiento.'
            },
            {
                codigo: 'b',
                texto: 'Se han clasificado los sistemas de almacenamiento en función de su tecnología.'
            }
        ]
    },

    // Pregunta de prueba
    testPregunta: {
        texto: '¿Qué es HDFS?',
        tipo: 'test',
        opciones: [
            'Hadoop Distributed File System',
            'High Definition File System',
            'Hybrid Data File System',
            'Hierarchical Distributed File System'
        ],
        respuestaCorrecta: 0,
        ra: 'RA1',
        asignatura: 'Big Data'
    },

    // Examen de prueba
    testExamen: {
        titulo: 'Examen Final Big Data',
        asignatura: 'Big Data',
        fecha: new Date('2026-02-10'),
        duracion: 90,
        preguntas: []
    },

    // Credenciales inválidas para tests negativos
    invalidCredentials: {
        wrongEmail: {
            nombreCompleto: 'Juan Pérez García',
            email: 'wrong@test.com',
            password: 'test123456'
        },
        wrongName: {
            nombreCompleto: 'Nombre Incorrecto',
            email: 'juan.perez@test.com',
            password: 'test123456'
        },
        wrongPassword: {
            nombreCompleto: 'Juan Pérez García',
            email: 'juan.perez@test.com',
            password: 'wrongpassword'
        }
    }
};
