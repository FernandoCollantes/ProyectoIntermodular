import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // -----------------------------------------------------------------------
  // 1. ZONA PRIVADA (PROFESOR) - Usa MainLayoutComponent
  // -----------------------------------------------------------------------
  {
    path: '',
    // Carga el Layout que acabamos de editar (con Sidebar y Header)
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard-module').then((m) => m.DashboardModule),
      },
      {
        path: 'preguntas',
        loadChildren: () =>
          import('./features/preguntas/preguntas-module').then((m) => m.PreguntasModule),
      },
      {
        path: 'examenes',
        loadChildren: () =>
          import('./features/examenes/examenes-module').then((m) => m.ExamenesModule),
      },
      {
        path: 'asignaturas',
        loadComponent: () =>
          import('./features/asignaturas/pages/asignaturas/asignaturas.component').then(
            (m) => m.AsignaturasComponent,
          ),
      },
      // Redirección por defecto: Si entran a la raíz, van al dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // -----------------------------------------------------------------------
  // 2. ZONA PÚBLICA (ALUMNO) - Sin Layout (Pantalla completa)
  // -----------------------------------------------------------------------
  {
    path: 'alumno',
    children: [
      {
        path: 'acceso',
        loadComponent: () =>
          import('./features/alumno/pages/acceso-alumno/acceso-alumno.component').then(
            (m) => m.AccesoAlumnoComponent,
          ),
      },
      {
        path: 'e/:token',
        loadComponent: () =>
          import('./features/alumno/pages/acceso-alumno/acceso-alumno.component').then(
            (m) => m.AccesoAlumnoComponent,
          ),
      },
      {
        path: 'realizar/:token',
        loadComponent: () =>
          import('./features/alumno/pages/realizar-examen/realizar-examen.component').then(
            (m) => m.RealizarExamenComponent,
          ),
      },
    ],
  },

  // -----------------------------------------------------------------------
  // 3. AUTH (LOGIN)
  // -----------------------------------------------------------------------
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-routing-module').then((m) => m.AuthRoutingModule),
  },

  // -----------------------------------------------------------------------
  // 3. RUTAS NO ENCONTRADAS
  // -----------------------------------------------------------------------
  { path: '**', redirectTo: 'dashboard' },
];
