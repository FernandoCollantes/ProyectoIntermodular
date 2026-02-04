# Documentación de Pruebas - Proyecto Intermodular

Este documento describe todas las pruebas realizadas en el proyecto, incluyendo scripts de verificación, población de datos, migraciones y tests de API.

## 📋 Índice

1. [Estructura de Pruebas](#estructura-de-pruebas)
2. [Pruebas Automatizadas](#pruebas-automatizadas)
3. [Scripts de Población de Datos (Seeds)](#scripts-de-población-de-datos-seeds)
4. [Scripts de Verificación](#scripts-de-verificación)
5. [Scripts de Migración](#scripts-de-migración)
6. [Tests de API](#tests-de-api)
7. [Historial de Pruebas](#historial-de-pruebas)
8. [Problemas Encontrados y Soluciones](#problemas-encontrados-y-soluciones)

---

## Estructura de Pruebas

Todos los scripts de prueba se encuentran organizados en la carpeta `backend/pruebas/`:

```
backend/pruebas/
├── seeds/          # Scripts de población de datos
├── verificacion/   # Scripts de verificación y chequeo
├── migracion/      # Scripts de migración y corrección
├── api/            # Tests de API
└── README.md       # Guía rápida de uso
```

---

## Scripts de Población de Datos (Seeds)

### seed.js
**Ubicación:** `backend/pruebas/seeds/seed.js`

**Propósito:** Script principal de población de datos. Crea la estructura completa del sistema incluyendo cursos, asignaturas, resultados de aprendizaje y criterios.

**Uso:**
```bash
cd backend
node pruebas/seeds/seed.js
```

**Datos que crea:**
- Cursos académicos (Big Data, Videojuegos, etc.)
- Asignaturas por curso
- Resultados de Aprendizaje (RAs)
- Criterios de evaluación
- Relaciones jerárquicas completas

**Resultado esperado:** Base de datos poblada con estructura académica completa.

---

### seed_courses.js
**Ubicación:** `backend/pruebas/seeds/seed_courses.js`

**Propósito:** Población específica de cursos y estructura académica.

**Uso:**
```bash
cd backend
node pruebas/seeds/seed_courses.js
```

**Datos que crea:**
- Cursos con sus asignaturas asociadas
- Estructura jerárquica curso → asignatura

---

### seed_profesor.js
**Ubicación:** `backend/pruebas/seeds/seed_profesor.js`

**Propósito:** Crear usuarios de prueba con rol de profesor.

**Uso:**
```bash
cd backend
node pruebas/seeds/seed_profesor.js
```

**Datos que crea:**
- Usuarios con rol "profesor"
- Credenciales de acceso para testing

---

### seed_questions_ra.js
**Ubicación:** `backend/pruebas/seeds/seed_questions_ra.js`

**Propósito:** Población de preguntas asociadas a resultados de aprendizaje.

**Uso:**
```bash
cd backend
node pruebas/seeds/seed_questions_ra.js
```

**Datos que crea:**
- Preguntas de evaluación
- Asociaciones con RAs específicos

---

## Scripts de Verificación

### check_courses.js
**Ubicación:** `backend/pruebas/verificacion/check_courses.js`

**Propósito:** Verificar la integridad de los datos de cursos y su estructura jerárquica.

**Uso:**
```bash
cd backend
node pruebas/verificacion/check_courses.js
```

**Verifica:**
- Existencia de cursos en la base de datos
- Relaciones curso → asignatura
- Integridad de datos jerárquicos

**Resultado esperado:** Reporte de cursos encontrados y su estructura.

---

### check_db.js
**Ubicación:** `backend/pruebas/verificacion/check_db.js`

**Propósito:** Verificar la conexión a la base de datos MongoDB.

**Uso:**
```bash
cd backend
node pruebas/verificacion/check_db.js
```

**Verifica:**
- Conexión exitosa a MongoDB
- Acceso a la base de datos configurada

**Resultado esperado:** Mensaje de conexión exitosa o error detallado.

---

### check_db_data.js
**Ubicación:** `backend/pruebas/verificacion/check_db_data.js`

**Propósito:** Verificar la integridad y consistencia de los datos en la base de datos.

**Uso:**
```bash
cd backend
node pruebas/verificacion/check_db_data.js
```

**Verifica:**
- Integridad referencial entre colecciones
- Datos huérfanos o inconsistentes
- Validación de estructura de documentos

**Resultado esperado:** Reporte de integridad de datos.

---

### count_db.js
**Ubicación:** `backend/pruebas/verificacion/count_db.js`

**Propósito:** Contar documentos en todas las colecciones de la base de datos.

**Uso:**
```bash
cd backend
node pruebas/verificacion/count_db.js
```

**Muestra:**
- Número de documentos por colección
- Resumen total de datos en el sistema

**Resultado esperado:** Tabla con conteo de documentos.

---

### verify_server.js
**Ubicación:** `backend/pruebas/verificacion/verify_server.js`

**Propósito:** Verificar que el servidor backend esté funcionando correctamente.

**Uso:**
```bash
cd backend
node pruebas/verificacion/verify_server.js
```

**Verifica:**
- Servidor escuchando en el puerto correcto
- Endpoints básicos respondiendo

**Resultado esperado:** Confirmación de servidor activo.

---

## Scripts de Migración

### migrate_temas.js
**Ubicación:** `backend/pruebas/migracion/migrate_temas.js`

**Propósito:** Migración de temas en la estructura de datos.

**Uso:**
```bash
cd backend
node pruebas/migracion/migrate_temas.js
```

**Acción:** Migra la estructura de temas a un nuevo formato.

⚠️ **Advertencia:** Este script modifica datos existentes. Hacer backup antes de ejecutar.

---

### migrate_temas_flatten.js
**Ubicación:** `backend/pruebas/migracion/migrate_temas_flatten.js`

**Propósito:** Migración de temas a estructura plana (flatten).

**Uso:**
```bash
cd backend
node pruebas/migracion/migrate_temas_flatten.js
```

**Acción:** Aplana la estructura jerárquica de temas.

---

### migrate_temas_native.js
**Ubicación:** `backend/pruebas/migracion/migrate_temas_native.js`

**Propósito:** Migración de temas usando métodos nativos de MongoDB.

**Uso:**
```bash
cd backend
node pruebas/migracion/migrate_temas_native.js
```

**Acción:** Migración optimizada usando operaciones nativas.

---

### fix_invalid_ras.js
**Ubicación:** `backend/pruebas/migracion/fix_invalid_ras.js`

**Propósito:** Corregir resultados de aprendizaje (RAs) inválidos o inconsistentes.

**Uso:**
```bash
cd backend
node pruebas/migracion/fix_invalid_ras.js
```

**Acción:**
- Identifica RAs con datos inválidos
- Corrige referencias rotas
- Limpia datos huérfanos

**Resultado esperado:** Reporte de RAs corregidos.

---

### swap_subjects.js
**Ubicación:** `backend/pruebas/migracion/swap_subjects.js`

**Propósito:** Intercambiar asignaturas entre cursos (corrección de error de asignación).

**Uso:**
```bash
cd backend
node pruebas/migracion/swap_subjects.js
```

**Acción:** Corrige la asignación incorrecta de asignaturas entre Big Data y Videojuegos.

**Contexto:** Se descubrió que las asignaturas estaban intercambiadas entre estos dos cursos.

---

## Tests de API

### test_api.js
**Ubicación:** `backend/pruebas/api/test_api.js`

**Propósito:** Tests básicos de endpoints de la API.

**Uso:**
```bash
cd backend
node pruebas/api/test_api.js
```

**Tests incluidos:**
- Endpoints básicos de CRUD
- Respuestas de API
- Códigos de estado HTTP

---

### test_auth.js
**Ubicación:** `backend/pruebas/api/test_auth.js`

**Propósito:** Tests de autenticación y autorización.

**Uso:**
```bash
cd backend
node pruebas/api/test_auth.js
```

**Tests incluidos:**
- Login de usuarios
- Validación de tokens
- Permisos por rol
- Endpoints protegidos

---

## Historial de Pruebas

### Enero 2026

#### Semana 3 (15-21 Enero)
- ✅ Implementación inicial de seeds
- ✅ Creación de estructura de cursos
- ✅ Tests de conexión a base de datos

#### Semana 4 (22-28 Enero)
- ✅ Descubrimiento de asignaturas intercambiadas entre Big Data y Videojuegos
- ✅ Creación de script `swap_subjects.js` para corregir el problema
- ✅ Implementación de `fix_invalid_ras.js` para limpiar RAs inválidos
- ✅ Tests de jerarquía de datos (curso → asignatura → RA → criterios)
- ✅ Corrección de dropdowns vacíos en frontend

#### Semana 5 (29 Enero - 2 Febrero)
- ✅ Migración de estructura de temas
- ✅ Tests de API completos
- ✅ Verificación de autenticación
- ✅ Generación de diagrama de clases

### Febrero 2026

#### Semana 1 (3-4 Febrero)
- ✅ Reorganización de scripts de prueba en carpeta `pruebas/`
- ✅ Creación de documentación de pruebas
- ✅ Limpieza de estructura del proyecto

---

## Problemas Encontrados y Soluciones

### Problema 1: Asignaturas Intercambiadas
**Fecha:** 28 Enero 2026

**Descripción:** Las asignaturas de Big Data y Videojuegos estaban asignadas al curso incorrecto.

**Impacto:** Los estudiantes veían asignaturas que no correspondían a su curso.

**Solución:** Script `swap_subjects.js` que intercambia las asignaturas entre los dos cursos.

**Estado:** ✅ Resuelto

---

### Problema 2: Dropdowns Vacíos en RAs
**Fecha:** 28 Enero 2026

**Descripción:** El dropdown de "Resultado de Aprendizaje" mostraba opciones en blanco antes de los RAs reales.

**Causa:** RAs con referencias inválidas o datos incompletos en la base de datos.

**Solución:** 
1. Script `fix_invalid_ras.js` para limpiar datos inválidos
2. Validación en backend para filtrar RAs sin datos válidos

**Estado:** ✅ Resuelto

---

### Problema 3: Criterios No Visibles
**Fecha:** 28 Enero 2026

**Descripción:** Al seleccionar un RA, no se mostraban los criterios de evaluación.

**Causa:** Problema de jerarquía en la base de datos y filtrado en frontend.

**Solución:** Corrección de relaciones jerárquicas y actualización de lógica de filtrado.

**Estado:** ✅ Resuelto

---

### Problema 4: Estructura de Temas Inconsistente
**Fecha:** Enero 2026

**Descripción:** La estructura de temas no era consistente entre diferentes partes del sistema.

**Solución:** Tres scripts de migración con diferentes enfoques:
- `migrate_temas.js` - Migración estándar
- `migrate_temas_flatten.js` - Estructura plana
- `migrate_temas_native.js` - Operaciones nativas optimizadas

**Estado:** ✅ Resuelto

---

## Recomendaciones

### Antes de Ejecutar Seeds
1. Hacer backup de la base de datos
2. Verificar conexión con `check_db.js`
3. Revisar datos existentes con `count_db.js`

### Antes de Ejecutar Migraciones
1. **SIEMPRE** hacer backup de la base de datos
2. Ejecutar en entorno de desarrollo primero
3. Verificar resultados con scripts de verificación
4. Documentar cambios realizados

### Flujo de Testing Recomendado
```bash
# 1. Verificar estado inicial
node pruebas/verificacion/check_db.js
node pruebas/verificacion/count_db.js

# 2. Ejecutar seeds si es necesario
node pruebas/seeds/seed.js

# 3. Verificar datos poblados
node pruebas/verificacion/check_db_data.js
node pruebas/verificacion/check_courses.js

# 4. Ejecutar tests de API
node pruebas/api/test_auth.js
node pruebas/api/test_api.js
```

---

## Contacto y Soporte

Para más información sobre las pruebas o para reportar problemas, consultar el [README.md](backend/pruebas/README.md) en la carpeta de pruebas.
