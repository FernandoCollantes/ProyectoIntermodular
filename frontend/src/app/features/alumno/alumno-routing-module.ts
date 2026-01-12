import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'acceso',
    loadComponent: () => import('./pages/acceso-alumno/acceso-alumno.component').then(m => m.AccesoAlumnoComponent)
  },
  {
    path: 'realizar-examen',
    loadComponent: () => import('./pages/realizar-examen/realizar-examen.component').then(m => m.RealizarExamenComponent)
  },
  {
    path: '',
    redirectTo: 'acceso',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlumnoRoutingModule { }
