import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- 1. Importa esto

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  // Datos de ejemplo para las tarjetas
  stats = [
    { etiqueta: 'Preguntas Totales', valor: 125, clase: 'primaria' },
    { etiqueta: 'Exámenes Creados', valor: 12, clase: 'exito' },
    { etiqueta: 'Alumnos Activos', valor: 450, clase: 'advertencia' },
    { etiqueta: 'Promedio General', valor: '7.8', clase: 'info' }
  ];
}