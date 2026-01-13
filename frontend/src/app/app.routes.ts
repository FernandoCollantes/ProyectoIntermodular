import { Routes } from '@angular/router';

export const routes: Routes = [
  // RUTAS DEL PROFESOR (Con Layout y Sidebar)
  {
    path: '',
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // RUTAS DEL ALUMNO (Sin Layout, a pantalla completa)
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

  // Comodín para errores
  { path: '**', redirectTo: 'dashboard' }
];