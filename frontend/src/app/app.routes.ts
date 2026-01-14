import { Routes } from '@angular/router';

export const routes: Routes = [
  // -----------------------------------------------------------------------
  // 1. ZONA PRIVADA (PROFESOR) - Usa MainLayoutComponent
  // -----------------------------------------------------------------------
  {
    path: '',
    // Carga el Layout que acabamos de editar (con Sidebar y Header)
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DashboardModule)
      },
      {
        path: 'preguntas',
        loadChildren: () => import('./features/preguntas/preguntas-module').then(m => m.PreguntasModule)
      },
      {
        path: 'examenes',
        loadChildren: () => import('./features/examenes/examenes-module').then(m => m.ExamenesModule)
      },
      // Redirección por defecto: Si entran a la raíz, van al dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // -----------------------------------------------------------------------
  // 2. ZONA PÚBLICA (ALUMNO) - Sin Layout (Pantalla completa)
  // -----------------------------------------------------------------------
  {
    path: 'alumno',
    children: [
      {
        path: 'acceso',
        loadComponent: () => import('./features/alumno/pages/acceso-alumno/acceso-alumno.component').then(m => m.AccesoAlumnoComponent)
      },
      {
        path: 'realizar-examen',
        loadComponent: () => import('./features/alumno/pages/realizar-examen/realizar-examen.component').then(m => m.RealizarExamenComponent)
      }
    ]
  },

  // -----------------------------------------------------------------------
  // 3. RUTAS NO ENCONTRADAS
  // -----------------------------------------------------------------------
  { path: '**', redirectTo: 'dashboard' }
];