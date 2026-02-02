import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { pendingChangesGuard } from '../../core/guards/pending-changes.guard';
import { MisPreguntasComponent } from './pages/mis-preguntas/mis-preguntas.component';
import { CrearPreguntaComponent } from './pages/crear-pregunta/crear-pregunta.component';
import { PreguntaCreationChoiceComponent } from './pages/pregunta-creation-choice/pregunta-creation-choice.component';
import { CrearPreguntaAiComponent } from './pages/crear-pregunta-ai/crear-pregunta-ai.component';

const routes: Routes = [
  {
    path: '',
    component: MisPreguntasComponent
  },
  {
    path: 'crear',
    loadComponent: () => import('./pages/pregunta-creation-choice/pregunta-creation-choice.component').then(m => m.PreguntaCreationChoiceComponent)
  },
  {
    path: 'manual',
    component: CrearPreguntaComponent,
    canDeactivate: [pendingChangesGuard]
  },
  {
    path: 'crear-ai',
    loadComponent: () => import('./pages/crear-pregunta-ai/crear-pregunta-ai.component').then(m => m.CrearPreguntaAiComponent),
    canDeactivate: [pendingChangesGuard]
  },
  {
    path: 'editar/:id',
    component: CrearPreguntaComponent,
    canDeactivate: [pendingChangesGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreguntasRoutingModule { }