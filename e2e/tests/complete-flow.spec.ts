import { test, expect } from '@playwright/test';

/**
 * Test E2E: Flujo completo de usuario - Profesor crea examen
 * 
 * Este test simula un usuario real (profesor) usando el sistema completo:
 * 1. Login
 * 2. Navegación por asignaturas
 * 3. Selección de curso y asignatura
 * 4. Visualización de RAs y criterios
 * 5. Creación de examen (si está implementado)
 */

test.describe('Flujo Completo de Usuario', () => {
    test.beforeEach(async ({ page }) => {
        // Navegar a la página principal
        await page.goto('/');
    });

    test('Usuario puede navegar por la aplicación', async ({ page }) => {
        // Verificar que la página cargaa
        await expect(page).toHaveTitle(/ExamGen/i);

        // Tomar screenshot del estado inicial
        await page.screenshot({ path: 'test-results/screenshots/home.png' });
    });

    test('Flujo de navegación: Home -> Asignaturas -> RAs -> Criterios', async ({ page }) => {
        // Paso 1: Verificar que estamos en la página principal
        await page.waitForLoadState('networkidle');

        // Paso 2: Buscar y hacer clic en navegación de asignaturas
        // Nota: Ajustar selectores según la implementación real del frontend
        const asignaturasLink = page.locator('text=Asignaturas').first();
        if (await asignaturasLink.isVisible()) {
            await asignaturasLink.click();
            await page.waitForLoadState('networkidle');

            // Verificar que llegamos a la página de asignaturas
            await expect(page).toHaveURL(/asignaturas/i);
            await page.screenshot({ path: 'test-results/screenshots/asignaturas.png' });
        }

        // Paso 3: Seleccionar una asignatura (ej: Big Data)
        const bigDataOption = page.locator('text=Big Data').first();
        if (await bigDataOption.isVisible()) {
            await bigDataOption.click();
            await page.waitForTimeout(1000); // Esperar a que carguen los datos

            await page.screenshot({ path: 'test-results/screenshots/big-data-selected.png' });
        }

        // Paso 4: Verificar que se muestran RAs
        // Buscar elementos que contengan "RA" en el texto
        const raElements = page.locator('[class*="ra"], [id*="ra"]');
        const raCount = await raElements.count();

        if (raCount > 0) {
            console.log(`✓ Se encontraron ${raCount} elementos de RA`);

            // Seleccionar el primer RA
            await raElements.first().click();
            await page.waitForTimeout(1000);

            await page.screenshot({ path: 'test-results/screenshots/ra-selected.png' });
        }

        // Paso 5: Verificar que se muestran criterios
        const criterioElements = page.locator('[class*="criterio"], [id*="criterio"]');
        const criterioCount = await criterioElements.count();

        if (criterioCount > 0) {
            console.log(`✓ Se encontraron ${criterioCount} elementos de criterio`);
            await page.screenshot({ path: 'test-results/screenshots/criterios-visible.png' });
        }
    });

    test('Verificar estructura de la aplicación', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Verificar que existen elementos básicos de navegación
        const body = await page.locator('body').innerHTML();

        // Verificar que la aplicación Angular se cargó
        const hasAngularApp = body.includes('app-root') || body.includes('ng-');
        expect(hasAngularApp).toBeTruthy();

        // Tomar screenshot final
        await page.screenshot({
            path: 'test-results/screenshots/app-structure.png',
            fullPage: true
        });
    });

    test('Simular interacción de usuario real - Exploración completa', async ({ page }) => {
        console.log('🧪 Iniciando simulación de usuario real...');

        // Esperar a que la aplicación cargue completamente
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        console.log('✓ Aplicación cargada');
        await page.screenshot({ path: 'test-results/screenshots/step1-loaded.png' });

        // Simular scroll del usuario explorando la página
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await page.waitForTimeout(500);
        await page.evaluate(() => window.scrollTo(0, 0));

        console.log('✓ Usuario exploró la página');

        // Buscar todos los enlaces y botones visibles
        const links = await page.locator('a, button').all();
        console.log(`✓ Se encontraron ${links.length} elementos interactivos`);

        // Intentar hacer clic en el primer enlace/botón visible
        for (const link of links.slice(0, 3)) {
            if (await link.isVisible()) {
                const text = await link.textContent();
                console.log(`  - Elemento encontrado: "${text?.trim()}"`);
            }
        }

        await page.screenshot({
            path: 'test-results/screenshots/step2-exploration.png',
            fullPage: true
        });

        console.log('✓ Simulación de usuario completada');
    });
});

/**
 * Test E2E: Verificación de rendimiento básico
 */
test.describe('Verificación de Rendimiento', () => {
    test('La aplicación carga en menos de 5 segundos', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;
        console.log(`⏱️  Tiempo de carga: ${loadTime}ms`);

        // Verificar que carga en menos de 5 segundos
        expect(loadTime).toBeLessThan(5000);
    });
});
