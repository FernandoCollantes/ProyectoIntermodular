import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Servicios
import { JerarquiaService } from '../../../../core/services/jerarquia.service';
import { PreguntaService } from '../../services/pregunta.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';

// Modelos
import { ModuloJerarquia, ResultadoAprendizaje } from '../../../../core/models/jerarquia.model';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-crear-pregunta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-pregunta.component.html',
  styleUrls: ['./crear-pregunta.component.scss']
})
export class CrearPreguntaComponent implements OnInit {
  public modulos: ModuloJerarquia[] = [];
  public rasDisponibles: ResultadoAprendizaje[] = [];
  protected readonly String = String;

  preguntaId: string | null = null;
  isEditMode: boolean = false;

  nuevaPregunta = {
    enunciado: '',
    asignatura: '',
    tema: '', // Required by DTO although we use criterios for multiple RAs
    dificultad: 1,
    opciones: ['', '', '', ''],
    respuesta_correcta: '0',
    criterios: [] as string[] // Stores selected RA codes
  };

  constructor(
    private jerarquiaService: JerarquiaService,
    private preguntaService: PreguntaService,
    private notiService: NotificacionService,
    private authService: AuthService,
    public router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // 1. Cargar Jerarquía
    this.jerarquiaService.getJerarquia().subscribe({
      next: (data: ModuloJerarquia[]) => {
        this.modulos = data;

        // 2. Comprobar si es edición
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.preguntaId = id;
          this.isEditMode = true;
          this.cargarPregunta(id);
        }
      },
      error: () => this.notiService.mostrar('Error al cargar datos del XML', 'error')
    });
  }

  cargarPregunta(id: string): void {
    this.preguntaService.obtenerPregunta(id).subscribe({
      next: (p) => {
        // Rellenar formulario
        this.nuevaPregunta = {
          enunciado: p.enunciado,
          asignatura: p.asignatura,
          tema: p.tema,
          dificultad: p.dificultad,
          opciones: [...p.opciones],
          respuesta_correcta: String(p.respuesta_correcta),
          criterios: [p.tema]
        };
        // Forzar carga de RAs para el módulo
        this.onModuloChange();
        // Restaurar tema (porque onModuloChange lo resetea)
        this.nuevaPregunta.tema = p.tema;
      },
      error: () => {
        this.notiService.mostrar('Error al cargar la pregunta', 'error');
        this.router.navigate(['/preguntas/mis-preguntas']);
      }
    });
  }

  onModuloChange(): void {
    const moduloSeleccionado = this.modulos.find((m: ModuloJerarquia) => m.nombre === this.nuevaPregunta.asignatura);
    if (moduloSeleccionado) {
      this.rasDisponibles = moduloSeleccionado.ras;
      // Sólo resetear si NO estamos cargando datos (o si el usuario cambia manualmente)
      // Para simplificar, si cambia de módulo manual, se resetea.
      // Al cargar, lo restauramos manualmente después.
      this.nuevaPregunta.tema = ''; // Reset functionality
    }
  }

  // Toggle RA logic removed as we use Radio now

  trackByIndex(index: number): number {
    return index;
  }

  guardar(): void {
    if (!this.nuevaPregunta.enunciado || !this.nuevaPregunta.asignatura || !this.nuevaPregunta.tema) {
      this.notiService.mostrar('Faltan campos obligatorios (Modulo, RA, Enunciado)', 'error');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notiService.mostrar('Error: Usuario no identificado', 'error');
      return;
    }

    // Map fields for backend compatibility
    const nuevaPreguntaDto = {
      ...this.nuevaPregunta,
      criterios: [this.nuevaPregunta.tema] // Pass as array for service compatibility
    };

    if (this.isEditMode && this.preguntaId) {
      this.preguntaService.actualizarPregunta(this.preguntaId, nuevaPreguntaDto as any, currentUser.id).subscribe({
        next: () => {
          this.notiService.mostrar('¡Pregunta actualizada con éxito!');
          this.router.navigate(['/preguntas/mis-preguntas']);
        },
        error: (err: any) => {
          console.error('Error del servidor:', err);
          const errorMsg = err.error && err.error.message ? err.error.message : 'Error al actualizar';
          this.notiService.mostrar(errorMsg, 'error');
        }
      });
    } else {
      this.preguntaService.crearPregunta(nuevaPreguntaDto as any, currentUser.id).subscribe({
        next: () => {
          this.notiService.mostrar('¡Pregunta guardada con éxito!');
          this.router.navigate(['/preguntas/mis-preguntas']);
        },
        error: (err: any) => {
          console.error('Error del servidor:', err);
          const errorMsg = err.error && err.error.message ? err.error.message : 'Error al crear';
          this.notiService.mostrar(errorMsg, 'error');
        }
      });
    }
  }
}