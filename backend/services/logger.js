const winston = require('winston');
const path = require('path');

// Definir el formato de los logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`;
    })
);

// Crear el logger
const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        // Escribir todos los logs en server.log
        new winston.transports.File({ 
            filename: path.join(__dirname, '../server.log'),
            level: 'info' 
        }),
        // También mostrar por consola
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        })
    ]
});

// Función para redirigir la consola al logger
const setupConsoleRedirection = () => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
        logger.info(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
    };

    console.error = (...args) => {
        logger.error(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
    };
};

module.exports = { logger, setupConsoleRedirection };
