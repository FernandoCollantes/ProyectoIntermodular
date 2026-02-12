# Pruebas End-to-End (E2E) con Playwright

Este directorio contiene la suite de pruebas automatizadas para el frontend del proyecto, utilizando [Playwright](https://playwright.dev/).

## 🚀 Inicio Rápido

1.  **Instalación:**
    ```bash
    cd e2e
    npm install
    npx playwright install
    ```

2.  **Asegúrate de que la aplicación esté corriendo:**
    - **Backend:** `http://localhost:3000`
    - **Frontend:** `http://localhost:4200`

3.  **Ejecutar tests:**
    ```bash
    npm run test:ui
    ```

## 📖 Guía Detallada

Para una explicación paso a paso sobre cómo crear nuevos tests, debugear y entender el flujo de la aplicación, consulta nuestra guía local:

👉 **[Guía de Playwright (Markdown)](../../.gemini/antigravity/brain/69b7b0fd-c8f4-4bc2-974f-1babc57fcb57/playwright_guide.md)**

## 📂 Estructura de Archivos

- `tests/`: Contiene los scripts de prueba.
  - `complete-flow.spec.ts`: Prueba el flujo principal del profesor.
- `playwright.config.ts`: Configuración general del entorno.

## 🛠️ Comandos Disponibles

- `npm test`: Ejecución rápida en consola (headless).
- `npm run test:ui`: Interfaz gráfica (Recomendado para desarrollo).
- `npm run test:headed`: Ejecuta viendo el navegador.
- `npm run test:debug`: Depuración paso a paso.

## 📊 Reportes y Resultados

- `test-results/`: Capturas y vídeos en caso de fallo.
- `npx playwright show-report`: Abre el reporte interactivo.
