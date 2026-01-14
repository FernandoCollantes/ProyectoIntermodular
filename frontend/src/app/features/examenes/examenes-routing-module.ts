import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Ajusta estas rutas de importación si tus carpetas se llaman diferente
import { MisExamenesComponent } from './pages/mis-examenes/mis-examenes.component';
import { CrearExamenComponent } from './pages/crear-examen/crear-examen.component';

const routes: Routes = [
  {
    path: '', 
    component: MisExamenesComponent // Carga la lista al entrar a /examenes
  },
  {
    path: 'crear',
    component: CrearExamenComponent // Carga el formulario en /examenes/crear
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExamenesRoutingModule { }