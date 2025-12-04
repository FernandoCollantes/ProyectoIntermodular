# Proyecto Intermodular - Generación Dinámica de Exámenes

## 📋 Descripción
Aplicación web para la generación dinámica de exámenes tipo test. Permite a los profesores crear bancos de preguntas, generar exámenes aleatorios y que los alumnos los realicen mediante enlaces únicos y exportarlos a PDF.

## 🚀 Stack Tecnológico

### Frontend
* Framework: Angular 16
* Lenguaje: TypeScript
* UI Library: Angular Material
* Estilos: SCSS

### Backend
* Runtime: Node.js
* Framework: Express.js
* Base de Datos: MongoDB Atlas
* ODM: Mongoose (Esquemas y Validaciones)
* Generación PDF: PDFKit (Server-Side)

## 👥 Equipo
* Fernando Collantes - Frontend & Documentación
* Andy - Backend & Base de Datos

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
* Node.js v18+ y npm
* MongoDB (local o Atlas)
* Angular CLI (`npm install -g @angular/cli`)

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
* Frontend: **http://localhost:4200**
* Backend: **http://localhost:3000**

## 📅 Cronograma
* Sprint 0: Configuración (20 Nov - 5 Dic 2025)
* Sprint 1: CRUD Preguntas + Auth (6-20 Dic 2025)
* Sprint 2: Categorización y Filtros (6-20 Ene 2026)
* Sprint 3: Generación Exámenes (21 Ene - 4 Feb 2026)
* Sprint 4: Corrección + Resultados (5-19 Feb 2026)
* Sprint 5: Exportación + Entrega (20-28 Feb 2026)

## 📝 Metodología
* Scrum adaptado con sprints de 15 días
* Weekly meetings todos los lunes
* Sprint Reviews al final de cada sprint

## 🔗 Enlaces
* **Repositorio GitHub**
* **Documentación Completa**

---

## Backend - API REST

### Tecnologías
* Node.js + Express: Servidor web y API.
* Mongoose: Modelado de datos estricto para integridad de la BD.
* PDFKit: Generación dinámica de documentos PDF en el servidor.
* **Arquitectura: MVC + Service Layer** (Model-View-Controller con capa de servicios para lógica de negocio desacoplada).

### Estructura de Carpetas
```
backend/
├── models/              # Esquemas Mongoose (Model)
│   ├── Pregunta.js
│   ├── Examen.js
│   └── Usuario.js
├── controllers/         # Controladores HTTP (Controller)
│   └── preguntasController.js
├── services/            # Lógica de negocio (Service Layer)
│   └── preguntasService.js
├── routes/              # Definición de endpoints (Routes)
│   └── preguntasRoutes.js
├── middleware/          # Middlewares (autenticación, validación)
├── config/              # Configuración (BD, variables entorno)
├── classes/             # Clases auxiliares y DTOs
└── server.js            # Punto de entrada
```

### Instalación
```bash
npm install
cp .env.example .env
# Configurar variables en .env
npm run dev
```

### Endpoints (Sprint 1+)

#### Búsqueda y Filtrado
* `GET /api/preguntas/search` - Búsqueda avanzada (filtra por asignatura, tema y dificultad).
* `GET /api/preguntas/subjects` - Obtener lista única de asignaturas (para dropdowns dinámicos).
* `GET /api/preguntas/themes` - Obtener temas filtrados por asignatura.

#### Gestión de Preguntas
* `POST /api/preguntas` - Crear nueva pregunta (valida y fusiona opciones correctas/incorrectas).
* `PUT /api/preguntas/:id` - Actualizar pregunta (futuro)
* `DELETE /api/preguntas/:id` - Eliminar pregunta (futuro)

#### Exámenes
* `POST /api/preguntas/exam` - Generar examen aleatorio basado en criterios.
* `POST /api/preguntas/download-pdf` - Descargar PDF del examen generado (Streaming binario).

### Notas de Desarrollo
* **Seguridad:** Se utiliza validación estricta en el controlador antes de procesar datos.
* **Rendimiento:** Uso de `lean()` en Mongoose para consultas rápidas de lectura.
* **Acceso:** Configurado para permitir acceso desde red local (IP) mediante rutas relativas y `express.static`.

---

## Frontend - Aplicación Angular

### Tecnologías
* Angular 17: Framework principal para la aplicación web.
* TypeScript: Lenguaje fuertemente tipado.
* Angular Material: Componentes UI profesionales con paleta Cyan/Orange personalizada.
* SCSS: Sistema de diseño modular con variables CSS.
* RxJS: Programación reactiva para comunicación con backend.
* **Arquitectura: MVVM (Model-View-ViewModel)** - Patrón nativo de Angular que separa lógica de presentación, datos y vista.

### Estructura de Carpetas
```
frontend/src/app/
├── core/                      # Funcionalidades globales
│   ├── models/                # Interfaces TypeScript (Model)
│   │   ├── usuario.model.ts
│   │   ├── pregunta.model.ts
│   │   └── examen.model.ts
│   ├── services/              # Servicios globales (Model)
│   │   └── auth.service.ts
│   ├── guards/                # Protección de rutas
│   │   ├── auth.guard.ts
│   │   └── profesor.guard.ts
│   └── interceptors/          # Interceptores HTTP (JWT)
│       └── auth.interceptor.ts
├── shared/                    # Componentes reutilizables
│   └── components/            # Header, Sidebar, Loading (View + ViewModel)
│       ├── header/
│       ├── sidebar/
│       └── loading/
├── features/                  # Módulos por funcionalidad (MVVM completo)
│   ├── auth/                  # Autenticación
│   │   ├── pages/             # Componentes de página (ViewModel + View)
│   │   ├── services/          # Servicios específicos (Model)
│   │   └── auth.module.ts
│   ├── dashboard/             # Panel principal
│   ├── preguntas/             # Gestión de preguntas
│   │   ├── pages/
│   │   │   ├── lista-preguntas/
│   │   │   └── crear-pregunta/
│   │   ├── services/
│   │   │   └── pregunta.service.ts
│   │   └── preguntas.module.ts
│   ├── examenes/              # Gestión de exámenes
│   └── alumno/                # Módulo alumno (realizar exámenes)
└── layouts/                   # Plantillas de página (View + ViewModel)
    ├── admin-layout/
    └── public-layout/
```

### Arquitectura MVVM

El frontend implementa el patrón **Model-View-ViewModel** donde:

- **Model (Modelo):** 
  - Interfaces TypeScript que definen la estructura de datos (`models/`)
  - Servicios que contienen lógica de negocio y comunicación con backend (`services/`)

- **View (Vista):** 
  - Templates HTML que definen la presentación visual
  - Uso de Angular Material para componentes profesionales

- **ViewModel (Modelo de Vista):** 
  - Componentes TypeScript que contienen lógica de presentación
  - Gestionan el estado de la vista y responden a eventos del usuario
  - Se comunican con los servicios (Model) para obtener/persistir datos

### Instalación
```bash
cd frontend
npm install
ng serve
# Aplicación disponible en http://localhost:4200
```

### Características Técnicas

* **Modularización por Features:** Cada funcionalidad (auth, preguntas, exámenes) tiene su propio módulo con componentes, servicios y modelos.
* **Guards y Interceptors:** Protección de rutas según rol de usuario y manejo automático de tokens JWT.
* **Sistema de Diseño:** Variables SCSS centralizadas con paleta Cyan (#00BCD4) y Orange (#FF6D00).
* **Accesibilidad:** Cumple con WCAG 2.1 Nivel AA (contraste 4.5:1, navegación por teclado, atributos ARIA).
* **Comunicación Reactiva:** Uso de HttpClient + RxJS Observables para peticiones HTTP asíncronas.
* **Responsive Design:** Breakpoints para tablet (768px) y móvil (480px).

### Flujo de Datos
```
Usuario interactúa con Vista (HTML)
       ↓
ViewModel (Componente TS) procesa evento
       ↓
Model (Service) hace petición HTTP al backend
       ↓
Backend responde con datos
       ↓
Service actualiza datos en ViewModel
       ↓
Vista se actualiza automáticamente (Data Binding)
```

### Notas de Desarrollo

* **TypeScript Strict Mode:** Activado para mayor seguridad de tipos.
* **Lazy Loading:** Módulos se cargan bajo demanda para mejorar rendimiento inicial.
* **Standalone Components:** (Futuro) Migración gradual a componentes standalone de Angular 17.
* **Testing:** Configurado con Jasmine y Karma para tests unitarios e de integración.

---

## 🤝 Comunicación Frontend-Backend

Ambas capas se comunican mediante **API REST**:

- El frontend realiza peticiones HTTP (GET, POST, PUT, DELETE) a los endpoints del backend.
- El backend valida, procesa y responde con JSON.
- La autenticación se gestiona mediante **JWT (JSON Web Tokens)** incluidos en headers HTTP.

**Ejemplo de flujo completo:**

1. Usuario rellena formulario "Crear Pregunta" (Frontend - View)
2. Componente captura datos del formulario (Frontend - ViewModel)
3. Servicio Angular hace POST a `/api/preguntas` (Frontend - Model)
4. Backend recibe petición en Routes → Controller → Service → Model
5. MongoDB guarda la pregunta
6. Backend responde con la pregunta creada (JSON)
7. Frontend actualiza la lista de preguntas reactivamente

---

## 📄 Licencia

Este proyecto es parte del módulo de Proyecto Integrado Intermodular del ciclo de Desarrollo de Aplicaciones Web.

---

## 📞 Contacto

* Fernando Collantes - [GitHub](#)
* Andy - [GitHub](#)
