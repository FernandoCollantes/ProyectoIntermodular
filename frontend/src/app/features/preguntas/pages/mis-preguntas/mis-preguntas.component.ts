import { Component, ViewEncapsulation } from '@angular/core'; // 1. Importar
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-preguntas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-preguntas.component.html',
  styleUrls: ['./mis-preguntas.component.scss'],
  encapsulation: ViewEncapsulation.None // 2. Activar estilos globales
})
export class MisPreguntasComponent {
  // Lógica futura de filtrado...
}