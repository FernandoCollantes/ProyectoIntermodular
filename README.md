# Proyecto Intermodular - Generación Dinámica de Exámenes

## 📋 Descripción
Aplicación web para la generación dinámica de exámenes tipo test. Permite a los profesores crear bancos de preguntas, generar exámenes aleatorios y que los alumnos los realicen mediante enlaces únicos y exportarlos a PDF.

## 🚀 Stack Tecnológico

### Frontend
- **Framework:** Angular 16
- **Lenguaje:** TypeScript
- **UI Library:** Angular Material
- **Estilos:** SCSS

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de Datos:** MongoDB Atlas
- **ODM:** Mongoose (Esquemas y Validaciones)
- **Generación PDF:** PDFKit (Server-Side)

## 👥 Equipo
- **Fernando Collantes** - Frontend & Documentación
- **Andy** - Backend & Base de Datos

## 📁 Estructura del Proyecto
```
ProyectoIntermodular/
├── frontend/         # Aplicación Angular
├── backend/          # API REST Node.js + Express
├── .gitignore
└── README.md
```

## 🔧 Instalación

### Requisitos Previos
- Node.js v18+ y npm
- MongoDB (local o Atlas)
- Angular CLI (`npm install -g @angular/cli`)

### Backend
```bash
cd backend
npm install
# Iniciar servidor en puerto 3000
npm start
```

### Frontend
```bash
cd frontend
npm install
ng serve
```

## 🌐 URLs de Desarrollo
- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000

## 📅 Cronograma
- **Sprint 0:** Configuración (20 Nov - 5 Dic 2025)
- **Sprint 1:** CRUD Preguntas + Auth (6-20 Dic 2025)
- **Sprint 2:** Categorización y Filtros (6-20 Ene 2026)
- **Sprint 3:** Generación Exámenes (21 Ene - 4 Feb 2026)
- **Sprint 4:** Corrección + Resultados (5-19 Feb 2026)
- **Sprint 5:** Exportación + Entrega (20-28 Feb 2026)

## 📝 Metodología
- **Scrum adaptado** con sprints de 15 días
- **Weekly meetings** todos los lunes
- **Sprint Reviews** al final de cada sprint

## 🔗 Enlaces
- [Repositorio GitHub](https://github.com/FernandoCollantes/ProyectoIntermodular)
- [Documentación Completa](./docs/)

# Backend - API REST

## Tecnologías
- Node.js + Express: Servidor web y API.
- Mongoose: Modelado de datos estricto para integridad de la BD.
- PDFKit: Generación dinámica de documentos PDF en el servidor.
- Arquitectura: Fat Server / Service Layer (Lógica de negocio desacoplada del controlador).

## Instalación
```bash
npm install
cp .env.example .env
# Configurar variables en .env
npm run dev
```

## Endpoints (Sprint 1+)

### Búsqueda y Filtrado
- `GET /api/preguntas/search` - Búsqueda avanzada (filtra por asignatura, tema y dificultad).
- `GET /api/preguntas/subjects` - Obtener lista única de asignaturas (para dropdowns dinámicos).
- `GET /api/preguntas/themes` - Obtener temas filtrados por asignatura.

### Gestión de Preguntas
- `POST /api/preguntas` - Crear nueva pregunta (valida y fusiona opciones correctas/incorrectas).

- `PUT /api/preguntas/:id` - Actualizar pregunta (futuro)
- `DELETE /api/preguntas/:id` - Eliminar pregunta (futuro)

### Exámenes
- `POST /api/preguntas/exam` - Generar examen aleatorio basado en criterios.
- `POST /api/preguntas/download-pdf` - Descargar PDF del examen generado (Streaming binario).

### Notas de Desarrollo

- **Seguridad:** Se utiliza validación estricta en el controlador antes de procesar datos.

- **Rendimiento:** Uso de lean() en Mongoose para consultas rápidas de lectura.

- **Acceso:** Configurado para permitir acceso desde red local (IP) mediante rutas relativas y express.static.
