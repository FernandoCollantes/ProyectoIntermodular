import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    // CAMBIO AQUÍ: de ./pages/lista-preguntas/ a ./pages/mis-preguntas/
    loadComponent: () => import('./pages/mis-preguntas/mis-preguntas.component')
      .then(m => m.MisPreguntasComponent)
  },
  {
    path: 'crear',
    loadComponent: () => import('./pages/crear-pregunta/crear-pregunta.component')
      .then(m => m.CrearPreguntaComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./pages/crear-pregunta/crear-pregunta.component')
      .then(m => m.CrearPreguntaComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreguntasRoutingModule { }