import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // Importamos las herramientas de navegación

@Component({
  selector: 'app-admin-layout',
  standalone: true, // Asegúrate de que tenga esto si es standalone
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // Las añadimos aquí para que funcionen en el HTML
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  // Aquí puedes añadir lógica más adelante, como cerrar sesión
}