// Setup global para los tests
// Este archivo se ejecuta antes de todos los tests

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';

// Timeout global para tests
jest.setTimeout(10000);

// Mock console para tests más limpios (opcional)
global.console = {
    ...console,
    // Descomentar para silenciar logs en tests
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    error: console.error, // Mantener errores visibles
};
