require('dotenv').config({ path: './Mongo.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const { connect } = require('./dataBase.js');

app.use(cors());
app.use(express.json());

// 1. Servir la aplicación principal (Gestor de Exámenes)
// Cuando entras a http://localhost:3000, verás index.html de 'Pagina'
//app.use(express.static(path.join(__dirname, 'Pagina')));

// 2. RESTAURADO: Servir la página de presentación y archivos raíz
// Esto permite acceder a otros archivos HTML o assets que tengas fuera de 'Pagina'
app.use(express.static(path.join(__dirname, 'Pagina')));
app.use(express.static(path.join(__dirname, '../'))); // Acceso a la raíz del proyecto (opcional, úsalo con cuidado)

// --- RUTAS MODULARES ---
app.use('/api/asignaturas', require('./routes/asignaturasRoutes'));
app.use('/api/preguntas', require('./routes/preguntasRoutes'));
app.use('/api/examenes', require('./routes/examenesRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

connect().then(() => {
    app.listen(3000, () => {
        console.log('Servidor escuchando en el puerto 3000');
    });
});