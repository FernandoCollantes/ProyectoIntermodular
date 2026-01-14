import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- IMPORTANTE

@Component({
  selector: 'app-mis-examenes',
  standalone: true,
  imports: [CommonModule, RouterModule], // <--- AÑADIRLO AQUÍ
  templateUrl: './mis-examenes.component.html',
  styleUrls: ['./mis-examenes.component.scss']
})
export class MisExamenesComponent {
  // Lógica futura...
}