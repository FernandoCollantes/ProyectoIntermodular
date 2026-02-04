// Setup global para tests de Vitest
import { vi } from 'vitest';
import 'zone.js';
import 'zone.js/testing';

// Mock de localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

globalThis.localStorage = localStorageMock as any;

// Mock de console para tests más limpios (opcional)
globalThis.console = {
    ...console,
    // Descomentar para silenciar logs en tests
    // log: vi.fn(),
    // debug: vi.fn(),
    // info: vi.fn(),
    // warn: vi.fn(),
    error: console.error, // Mantener errores visibles
};
