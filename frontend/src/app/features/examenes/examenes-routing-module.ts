import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MisExamenesComponent } from './pages/mis-examenes/mis-examenes.component';
import { CrearExamenComponent } from './pages/crear-examen/crear-examen.component';
import { BorradoresComponent } from './pages/borradores/borradores.component';

const routes: Routes = [
  {
    path: '',
    component: MisExamenesComponent // Carga la lista al entrar a /examenes
  },
  {
    path: 'elegir',
    loadComponent: () => import('./pages/exam-creation-choice/exam-creation-choice.component').then(m => m.ExamCreationChoiceComponent)
  },
  {
    path: 'crear',
    component: CrearExamenComponent // Carga el formulario en /examenes/crear
  },
  {
    path: 'crear-ai',
    loadComponent: () => import('./pages/crear-examen-ai/crear-examen-ai.component').then(m => m.CrearExamenAiComponent)
  },
  {
    path: 'editar/:id',
    component: CrearExamenComponent // Reutiliza el formulario para editar
  },
  {
    path: 'borradores',
    component: BorradoresComponent // Carga los borradores en /examenes/borradores
  },
  {
    path: 'realizados',
    loadComponent: () => import('./pages/examenes-realizados/examenes-realizados.component').then(m => m.ExamenesRealizadosComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExamenesRoutingModule { }