import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { pendingChangesGuard } from '../../core/guards/pending-changes.guard';
import { MisPreguntasComponent } from './pages/mis-preguntas/mis-preguntas.component';
import { CrearPreguntaComponent } from './pages/crear-pregunta/crear-pregunta.component';

const routes: Routes = [
  {
    path: '',
    component: MisPreguntasComponent
  },
  {
    path: 'crear',
    component: CrearPreguntaComponent,
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