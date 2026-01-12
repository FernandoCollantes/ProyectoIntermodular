import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/lista-preguntas/lista-preguntas.component').then(m => m.ListaPreguntasComponent)
  },
  {
    path: 'crear',
    loadComponent: () => import('./pages/crear-pregunta/crear-pregunta.component').then(m => m.CrearPreguntaComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreguntasRoutingModule { }
