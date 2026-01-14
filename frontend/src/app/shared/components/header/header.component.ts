import { Component, Input } from '@angular/core'; // <--- Añadir Input
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // Recibimos los datos del padre (MainLayout)
  @Input() titulo: string = 'ExamGen';
  @Input() iniciales: string = 'US';
}