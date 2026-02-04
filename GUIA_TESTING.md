# Guía de Pruebas Automatizadas - Proyecto Intermodular

## 🧪 Suite de Pruebas Implementada

El proyecto cuenta con tres niveles de testing automatizado:

### 1. Backend Unit Tests (Jest) ✅

**Ubicación:** `backend/__tests__/`  
**Tests implementados:** 21  
**Estado:** 100% passing

**Ejecutar:**
```bash
cd backend
npm test                  # Todos los tests
npm run test:watch       # Modo watch
npm run test:coverage    # Con cobertura
```

**Tests incluidos:**
- ✅ authController (6 tests) - Login, validación, errores
- ✅ asignaturasController (5 tests) - CRUD de asignaturas y RAs
- ✅ asignaturasService (10 tests) - Lógica de negocio

---

### 2. Frontend Unit Tests (Vitest) 🔧

**Ubicación:** `frontend/src/app/__tests__/`  
**Estado:** Infraestructura configurada, lista para implementar tests

**Ejecutar:**
```bash
cd frontend
npm test                  # Ejecutar tests
npm run test:ui          # Interfaz visual
npm run test:coverage    # Con cobertura
```

**Configuración:**
- ✅ Vitest configurado con jsdom
- ✅ Test setup con Zone.js y mocks
- ✅ Estructura de carpetas creada

---

### 3. Tests E2E - Usuario Simulado (Playwright) ✅

**Ubicación:** `e2e/`  
**Tests implementados:** 5 escenarios  
**Características:** Screenshots, videos, reportes HTML

**Prerequisitos:**
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm start

# Terminal 3 - Tests E2E
cd e2e
npm install
npx playwright install
npm test
```

**Comandos:**
```bash
npm test                 # Headless
npm run test:headed     # Ver navegador
npm run test:ui         # Interfaz visual
npm run test:debug      # Modo debug
```

**Tests implementados:**
1. ✅ Navegación por la aplicación
2. ✅ Flujo completo: Home → Asignaturas → RAs → Criterios
3. ✅ Verificación de estructura
4. ✅ Simulación de usuario real
5. ✅ Verificación de rendimiento (< 5s)

**Ver reportes:**
```bash
npx playwright show-report
```

---

## 📊 Resultados

### Backend Tests
```
Test Suites: 3 passed, 3 total
Tests:       21 passed, 21 total
Time:        ~1.4s
```

### E2E Tests
- Screenshots guardados en `e2e/test-results/screenshots/`
- Videos de fallos en `e2e/test-results/videos/`
- Reportes HTML en `e2e/playwright-report/`

---

## 📁 Estructura de Archivos

```
ProyectoIntermodular/
├── backend/
│   ├── __tests__/              # Unit tests
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── fixtures/
│   │   └── setup/
│   └── jest.config.js
│
├── frontend/
│   ├── src/
│   │   ├── app/__tests__/      # Unit tests
│   │   └── test-setup.ts
│   └── vitest.config.ts
│
└── e2e/                         # Tests E2E
    ├── tests/
    │   └── complete-flow.spec.ts
    ├── playwright.config.ts
    └── README.md
```

---

## 🚀 Inicio Rápido

### Ejecutar todos los tests del backend
```bash
cd backend
npm test
```

### Ejecutar tests E2E
```bash
# 1. Iniciar backend y frontend
cd backend && npm start
cd frontend && npm start

# 2. Ejecutar tests
cd e2e && npm test
```

---

## 📚 Documentación Adicional

- **Tests E2E:** Ver [e2e/README.md](file:///d:/Github/ProyectoIntermodular/e2e/README.md)
- **Pruebas Manuales:** Ver [PRUEBAS.md](file:///d:/Github/ProyectoIntermodular/PRUEBAS.md)
- **Encuestas de Usuario:** Ver [ENCUESTAS_USUARIOS.md](file:///d:/Github/ProyectoIntermodular/ENCUESTAS_USUARIOS.md)

---

## ✅ Checklist de Testing

Antes de hacer deploy o merge:

- [ ] Ejecutar `npm test` en backend (debe pasar 21/21 tests)
- [ ] Ejecutar tests E2E con backend y frontend activos
- [ ] Revisar cobertura de código (`npm run test:coverage`)
- [ ] Verificar que no hay tests skipped o pendientes
- [ ] Revisar screenshots de tests E2E para validar UI

---

## 💡 Tips

1. **Modo watch en desarrollo:**
   ```bash
   npm run test:watch
   ```

2. **Ver solo un test:**
   ```bash
   npx jest authController.test.js
   ```

3. **Debug de test E2E:**
   ```bash
   npm run test:debug
   ```

4. **Generar reporte de cobertura:**
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```
