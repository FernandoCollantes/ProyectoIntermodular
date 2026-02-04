# Carpeta de Pruebas

Esta carpeta contiene todos los scripts de prueba, verificación, migración y población de datos del proyecto. Los scripts están organizados por categoría para facilitar su localización y uso.

## Estructura

```
pruebas/
├── seeds/          # Scripts de población de datos de prueba
├── verificacion/   # Scripts de verificación y chequeo
├── migracion/      # Scripts de migración y corrección de datos
└── api/            # Tests de API y autenticación
```

## 📦 Seeds (Población de Datos)

Scripts para poblar la base de datos con datos de prueba.

### Uso
```bash
# Desde la carpeta backend
node pruebas/seeds/[nombre_script].js
```

### Scripts Disponibles

- **`seed.js`** - Seed principal con datos completos del sistema
- **`seed_courses.js`** - Población de cursos y estructura académica
- **`seed_profesor.js`** - Creación de usuarios profesor de prueba
- **`seed_questions_ra.js`** - Población de preguntas de resultados de aprendizaje

## ✅ Verificación

Scripts para verificar el estado de la base de datos y el servidor.

### Uso
```bash
# Desde la carpeta backend
node pruebas/verificacion/[nombre_script].js
```

### Scripts Disponibles

- **`check_courses.js`** - Verifica la estructura y datos de cursos
- **`check_db.js`** - Verifica la conexión a la base de datos
- **`check_db_data.js`** - Verifica la integridad de los datos
- **`count_db.js`** - Cuenta documentos en las colecciones
- **`verify_server.js`** - Verifica que el servidor esté funcionando

## 🔄 Migración

Scripts para migrar o corregir datos existentes en la base de datos.

### Uso
```bash
# Desde la carpeta backend
node pruebas/migracion/[nombre_script].js
```

### Scripts Disponibles

- **`migrate_temas.js`** - Migración de temas
- **`migrate_temas_flatten.js`** - Migración de temas (estructura plana)
- **`migrate_temas_native.js`** - Migración de temas (método nativo)
- **`fix_invalid_ras.js`** - Corrección de resultados de aprendizaje inválidos
- **`swap_subjects.js`** - Intercambio de asignaturas entre cursos

## 🧪 API Tests

Scripts para probar endpoints de la API.

### Uso
```bash
# Desde la carpeta backend
node pruebas/api/[nombre_script].js
```

### Scripts Disponibles

- **`test_api.js`** - Tests básicos de API
- **`test_auth.js`** - Tests de autenticación y autorización

## Notas Importantes

⚠️ **Advertencia**: Algunos scripts de migración y seeds pueden modificar o eliminar datos en la base de datos. Úsalos con precaución en entornos de producción.

💡 **Tip**: Ejecuta primero los scripts de verificación para asegurarte del estado actual de la base de datos antes de ejecutar seeds o migraciones.
