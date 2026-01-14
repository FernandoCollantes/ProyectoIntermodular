import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // 1. Importar para el router-outlet
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component'; // 2. Importar para el sidebar
// Si también pusiste el <app-header>, descomenta la línea de abajo:
// import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  // 3. AQUI es donde solucionamos el error añadiéndolos a "imports":
  imports: [
    RouterOutlet, 
    SidebarComponent
    // HeaderComponent (si lo tienes en el HTML)
  ],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss'] // O .scss si usas sass
})
export class AdminLayout {}