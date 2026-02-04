module.exports = {
    // Entorno de testing
    testEnvironment: 'node',

    // Patrón de archivos de test
    testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.spec.js'
    ],

    // Archivos a ignorar
    testPathIgnorePatterns: [
        '/node_modules/',
        '/pruebas/'
    ],

    // Cobertura de código
    collectCoverageFrom: [
        'controllers/**/*.js',
        'services/**/*.js',
        'routes/**/*.js',
        '!**/node_modules/**',
        '!**/pruebas/**'
    ],

    // Umbral de cobertura
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },

    // Timeout para tests
    testTimeout: 10000,

    // Setup antes de los tests
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup/testSetup.js'],

    // Verbose output
    verbose: true,

    // Limpiar mocks automáticamente
    clearMocks: true,

    // Restaurar mocks automáticamente
    restoreMocks: true
};
