import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// Servicios
import { JerarquiaService } from '../../../../core/services/jerarquia.service';
import { PreguntaService } from '../../services/pregunta.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

// Modelos
import { ModuloJerarquia, ResultadoAprendizaje } from '../../../../core/models/jerarquia.model';

import { AuthService } from '../../../../core/services/auth.service';
import { HasPendingChanges } from '../../../../core/guards/pending-changes.guard';

@Component({
  selector: 'app-crear-pregunta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-pregunta.component.html',
  styleUrls: ['./crear-pregunta.component.scss']
})
export class CrearPreguntaComponent implements OnInit, HasPendingChanges {
  @ViewChild('preguntaForm') preguntaForm!: NgForm;
  public modulos: ModuloJerarquia[] = [];
  public rasDisponibles: ResultadoAprendizaje[] = [];
  protected readonly String = String;

  preguntaId: string | null = null;
  isEditMode: boolean = false;

  nuevaPregunta = {
    enunciado: '',
    asignatura: '',
    tema: [] as string[], // Changed to array for multiple RAs
    dificultad: 1,
    opciones: ['', '', '', ''],
    respuesta_correcta: '0'
  };

  constructor(
    private jerarquiaService: JerarquiaService,
    private preguntaService: PreguntaService,
    private notiService: NotificacionService,
    private confirmationService: ConfirmationService,
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
          tema: Array.isArray(p.tema) ? [...p.tema] : [p.tema], // Handle legacy string or array
          dificultad: p.dificultad,
          opciones: [...p.opciones],
          respuesta_correcta: String(p.respuesta_correcta)
        };
        // Forzar carga de RAs para el módulo
        this.onModuloChange();
        // Restaurar tema (porque onModuloChange lo resetea)
        this.nuevaPregunta.tema = Array.isArray(p.tema) ? [...p.tema] : [p.tema];
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
      this.nuevaPregunta.tema = []; // Reset RAs when module changes
    }
  }

  hasPendingChanges(): boolean {
    return this.preguntaForm && this.preguntaForm.dirty || false;
  }

  toggleRA(codigo: string): void {
    const index = this.nuevaPregunta.tema.indexOf(codigo);
    if (index === -1) {
      this.nuevaPregunta.tema.push(codigo);
    } else {
      this.nuevaPregunta.tema.splice(index, 1);
    }
  }

  isRASelected(codigo: string): boolean {
    return this.nuevaPregunta.tema.includes(codigo);
  }

  // Toggle RA logic removed as we use Radio now

  trackByIndex(index: number): number {
    return index;
  }

  guardar(): void {
    // Check custom validations first
    if (!this.nuevaPregunta.asignatura) {
      this.notiService.mostrar('Por favor, selecciona una asignatura', 'error');
      return;
    }
    if (this.nuevaPregunta.tema.length === 0) {
      this.notiService.mostrar('Por favor, selecciona al menos un Resultado de Aprendizaje (RA)', 'error');
      return;
    }

    // Use NgForm validation for the rest
    if (this.preguntaForm && this.preguntaForm.invalid) {
      this.notiService.mostrar('Por favor, completa todos los campos obligatorios del formulario', 'error');
      // Mark fields as touched for visual feedback if styles support it
      Object.keys(this.preguntaForm.controls).forEach(key => {
        this.preguntaForm.controls[key].markAsTouched();
      });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notiService.mostrar('Error: Usuario no identificado', 'error');
      return;
    }

    // Map fields for backend compatibility
    const nuevaPreguntaDto = {
      ...this.nuevaPregunta
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
          this.resetearFormulario();
        },
        error: (err: any) => {
          console.error('Error del servidor:', err);
          const errorMsg = err.error && err.error.message ? err.error.message : 'Error al crear';
          this.notiService.mostrar(errorMsg, 'error');
        }
      });
    }
  }

  async cancelar(): Promise<void> {
    // Check if form has been modified
    const formModified = this.nuevaPregunta.enunciado !== '' ||
      this.nuevaPregunta.asignatura !== '' ||
      this.nuevaPregunta.tema.length > 0 ||
      this.nuevaPregunta.opciones.some(op => op !== '');

    if (formModified) {
      const confirmar = await this.confirmationService.confirm({
        title: '¿Está seguro que desea cancelar?',
        message: 'Se perderán todos los cambios realizados en el formulario.',
        confirmText: 'Sí, cancelar',
        cancelText: 'No, continuar',
        type: 'warning'
      });

      if (confirmar) {
        this.resetearFormulario();
      }
    } else {
      this.resetearFormulario();
    }
  }

  private resetearFormulario(): void {
    this.nuevaPregunta = {
      enunciado: '',
      asignatura: '',
      tema: [],
      opciones: ['', '', '', ''],
      respuesta_correcta: '0',
      dificultad: 1
    };
    this.rasDisponibles = [];
  }
}