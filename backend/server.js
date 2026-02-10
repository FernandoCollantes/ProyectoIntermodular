require('dotenv').config({ path: './Mongo.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const { connect } = require('./dataBase.js');

const { setupConsoleRedirection, logger } = require('./services/logger');

// Configurar redirección de consola al logger (opcional pero solicitado)
setupConsoleRedirection();

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

// Middleware Global de Errores (para capturar lo que no se gestione manualmente)
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err.stack || err.message || err);
    res.status(500).json({ message: 'Error interno del servidor capturado por el logger' });
});

const os = require('os');

connect().then(() => {
    app.listen(3000, () => {
        const networkInterfaces = os.networkInterfaces();
        let localIp = 'localhost';

        for (const interfaceName in networkInterfaces) {
            for (const iface of networkInterfaces[interfaceName]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIp = iface.address;
                }
            }
        }

        console.log('--------------------------------------------------');
        console.log(`Servidor Backend corriendo en:`);
        console.log(`- Local:   http://localhost:3000`);
        console.log(`- Red:     http://${localIp}:3000`);
        console.log('--------------------------------------------------');
    });
});