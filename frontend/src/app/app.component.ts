import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificacionService, Notificacion } from '@core/services/notificacion.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  //styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // Aquí guardamos la notificación para que el HTML pueda verla
  notificacion: Notificacion | null = null;

  constructor(private notiService: NotificacionService) {}

  ngOnInit(): void {
    // Nos suscribimos al canal de noticias
    this.notiService.notificacion$.subscribe(noti => {
      this.notificacion = noti;

      // Desvanecer la notificación después de 3 segundos
      setTimeout(() => {
        this.notificacion = null;
      }, 3000);
    });
  }
}