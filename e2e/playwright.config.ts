import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests',

    // Timeout para cada test
    timeout: 30 * 1000,

    // Configuración de expect
    expect: {
        timeout: 5000
    },

    // Ejecutar tests en paralelo
    fullyParallel: true,

    // Fallar el build si dejaste test.only en el código
    forbidOnly: !!process.env.CI,

    // Reintentos en CI
    retries: process.env.CI ? 2 : 0,

    // Workers en paralelo
    workers: process.env.CI ? 1 : undefined,

    // Reporter
    reporter: [
        ['html'],
        ['list']
    ],

    // Configuración compartida para todos los proyectos
    use: {
        // URL base para usar en tests
        baseURL: 'http://localhost:4200',

        // Capturar screenshots solo en fallos
        screenshot: 'only-on-failure',

        // Capturar videos solo en fallos
        video: 'retain-on-failure',

        // Trace solo en retry
        trace: 'on-first-retry',
    },

    // Configurar proyectos para diferentes navegadores
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        // Descomentar para probar en más navegadores
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },

        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
    ],

    // Servidor de desarrollo (opcional)
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://localhost:4200',
    //   reuseExistingServer: !process.env.CI,
    // },
});
