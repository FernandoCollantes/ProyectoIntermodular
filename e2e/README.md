# Tests E2E - Proyecto Intermodular

Este directorio contiene los tests end-to-end (E2E) usando Playwright para simular usuarios reales interactuando con la aplicación.

## 📋 Prerequisitos

Antes de ejecutar los tests E2E, asegúrate de que:

1. **Backend está ejecutándose:**
   ```bash
   cd backend
   npm start
   ```
   El backend debe estar disponible en `http://localhost:3000` (o el puerto configurado)

2. **Frontend está ejecutándose:**
   ```bash
   cd frontend
   npm start
   ```
   El frontend debe estar disponible en `http://localhost:4200`

3. **Base de datos MongoDB está activa** y tiene datos de prueba (ejecutar seeds si es necesario)

## 🚀 Instalación

```bash
cd e2e
npm install
npx playwright install
```

## 🧪 Ejecutar Tests

### Modo Headless (sin interfaz gráfica)
```bash
npm test
```

### Modo Headed (ver el navegador)
```bash
npm run test:headed
```

### Modo UI (interfaz visual de Playwright)
```bash
npm run test:ui
```

### Modo Debug
```bash
npm run test:debug
```

## 📁 Estructura

```
e2e/
├── tests/
│   └── complete-flow.spec.ts    # Test de flujo completo de usuario
├── playwright.config.ts          # Configuración de Playwright
├── package.json
└── README.md
```

## 📸 Screenshots y Videos

Los tests capturan automáticamente:
- **Screenshots** en caso de fallo
- **Videos** en caso de fallo
- **Traces** para debugging

Los archivos se guardan en:
- `test-results/` - Screenshots y videos
- `playwright-report/` - Reporte HTML

## 🎯 Tests Implementados

### `complete-flow.spec.ts`
Simula un usuario real navegando por la aplicación:
1. ✅ Carga de la aplicación
2. ✅ Navegación por asignaturas
3. ✅ Selección de curso (Big Data)
4. ✅ Visualización de RAs
5. ✅ Visualización de criterios
6. ✅ Verificación de rendimiento

## 📊 Ver Reportes

Después de ejecutar los tests:

```bash
npx playwright show-report
```

Esto abrirá un servidor local con el reporte HTML interactivo.

## 🔧 Configuración

Edita `playwright.config.ts` para:
- Cambiar la URL base
- Ajustar timeouts
- Configurar más navegadores
- Modificar configuración de screenshots/videos

## 💡 Tips

1. **Ejecutar un solo test:**
   ```bash
   npx playwright test complete-flow.spec.ts
   ```

2. **Ejecutar tests con un patrón:**
   ```bash
   npx playwright test --grep "Flujo completo"
   ```

3. **Ver el trace de un test fallido:**
   ```bash
   npx playwright show-trace test-results/.../trace.zip
   ```

## ⚠️ Notas Importantes

- Los tests E2E requieren que **backend y frontend estén ejecutándose**
- Los selectores en los tests pueden necesitar ajustes según la implementación del frontend
- Se recomienda ejecutar los tests en un entorno de desarrollo, no en producción
- Los tests capturan screenshots que se guardan en `test-results/screenshots/`

## 🐛 Debugging

Si un test falla:

1. Revisa los screenshots en `test-results/screenshots/`
2. Revisa el video en `test-results/videos/`
3. Ejecuta en modo debug: `npm run test:debug`
4. Usa el modo UI para ver paso a paso: `npm run test:ui`
