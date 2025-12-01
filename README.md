# Proyecto Intermodular - Generación Dinámica de Exámenes

## 📋 Descripción
Aplicación web para la generación dinámica de exámenes tipo test. Permite a los profesores crear bancos de preguntas, generar exámenes aleatorios y que los alumnos los realicen mediante enlaces únicos.

## 🚀 Stack Tecnológico

### Frontend
- **Framework:** Angular 17+
- **Lenguaje:** TypeScript
- **UI Library:** Angular Material
- **Estilos:** SCSS

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de Datos:** MongoDB Atlas
- **Autenticación:** JWT (JSON Web Tokens)
- **Email:** Nodemailer

## 👥 Equipo
- **Fernando Collantes** - Frontend & Documentación
- **Andy** - Backend & Base de Datos

## 📁 Estructura del Proyecto
```
ProyectoIntermodular/
├── frontend/         # Aplicación Angular
├── backend/          # API REST Node.js + Express
├── docs/             # Documentación (wireframes, mockups, memoria)
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
cp .env.example .env
# Configurar variables en .env
npm run dev
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
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticación
- Express Validator

## Instalación
```bash
npm install
cp .env.example .env
# Configurar variables en .env
npm run dev
```

## Endpoints (Sprint 1+)

### Autenticación
- `POST /api/auth/registro` - Registrar profesor
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil (protegido)

### Preguntas
- `GET /api/preguntas` - Listar preguntas
- `POST /api/preguntas` - Crear pregunta (profesor)
- `GET /api/preguntas/:id` - Obtener pregunta
- `PUT /api/preguntas/:id` - Actualizar pregunta (profesor)
- `DELETE /api/preguntas/:id` - Eliminar pregunta (profesor)

### Exámenes
- `POST /api/examenes` - Crear examen
- `GET /api/examenes` - Listar exámenes
- `GET /api/examenes/:id` - Obtener examen
- `GET /api/examenes/realizar/:linkUnico` - Acceso alumno

### Resultados
- `POST /api/examenes/:linkUnico/enviar` - Enviar respuestas
- `GET /api/resultados/:id` - Ver resultado