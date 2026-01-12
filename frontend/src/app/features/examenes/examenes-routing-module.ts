import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'crear',
    loadComponent: () => import('./pages/crear-examen/crear-examen.component').then(m => m.CrearExamenComponent)
  },
  {
    path: '',
    redirectTo: 'crear',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExamenesRoutingModule { }
