import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importamos el archivo de rutas de este módulo
import { ExamenesRoutingModule } from './examenes-routing-module';

// Importamos los componentes
import { MisExamenesComponent } from './pages/mis-examenes/mis-examenes.component';
import { CrearExamenComponent } from './pages/crear-examen/crear-examen.component';

@NgModule({
  declarations: [], // SE DEJA VACÍO (porque los componentes son standalone)
  imports: [
    CommonModule,
    ExamenesRoutingModule,
    // Los componentes standalone se añaden AQUÍ:
    MisExamenesComponent,
    CrearExamenComponent
  ]
})
export class ExamenesModule { }