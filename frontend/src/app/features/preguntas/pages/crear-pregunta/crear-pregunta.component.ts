import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Servicios
import { JerarquiaService } from '../../../../core/services/jerarquia.service';
import { PreguntaService } from '../../services/pregunta.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';

// Modelos
import { ModuloJerarquia, ResultadoAprendizaje } from '../../../../core/models/jerarquia.model';

@Component({
  selector: 'app-crear-pregunta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-pregunta.component.html',
  styleUrls: ['./crear-pregunta.component.scss']
})
export class CrearPreguntaComponent implements OnInit {
  // 1. RE-DECLARAMOS LAS VARIABLES (Esto quita los errores de 'does not exist')
  public modulos: ModuloJerarquia[] = [];
  public rasDisponibles: ResultadoAprendizaje[] = [];
  protected readonly String = String;

  // 2. OBJETO AJUSTADO (Andy quiere 'criterios' como string[] también)
  nuevaPregunta = {
    enunciado: '',
    asignatura: '', 
    tema: '',       
    dificultad: 1, 
    opciones: ['', '', '', ''],
    respuesta_correcta: '0', 
    criterios: [] as string[] // <--- CAMBIO: de number[] a string[]
  };

  constructor(
    private jerarquiaService: JerarquiaService,
    private preguntaService: PreguntaService,
    private notiService: NotificacionService,
    public router: Router 
  ) {}

  ngOnInit(): void {
    this.jerarquiaService.getJerarquia().subscribe({
      next: (data: ModuloJerarquia[]) => { // Tipado (m) para evitar TS7006
        this.modulos = data;
      },
      error: () => this.notiService.mostrar('Error al cargar datos del XML', 'error')
    });
  }

  onModuloChange(): void {
    // Tipado explícito de 'm' para solucionar el error TS7006
    const moduloSeleccionado = this.modulos.find((m: ModuloJerarquia) => m.nombre === this.nuevaPregunta.asignatura);
    if (moduloSeleccionado) {
      this.rasDisponibles = moduloSeleccionado.ras;
      this.nuevaPregunta.tema = ''; 
    }
  }

  guardar(): void {
    if (!this.nuevaPregunta.enunciado || !this.nuevaPregunta.asignatura || !this.nuevaPregunta.tema) {
      this.notiService.mostrar('Faltan campos obligatorios', 'error');
      return;
    }

    this.preguntaService.crearPregunta(this.nuevaPregunta).subscribe({
      next: () => {
        this.notiService.mostrar('¡Pregunta guardada con éxito!');
        this.router.navigate(['/preguntas/mis-preguntas']);
      },
      error: (err: any) => {
        console.error('Error del servidor:', err);
        this.notiService.mostrar('El servidor rechazó la pregunta', 'error');
      }
    });
  }
}