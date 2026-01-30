import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// Services
import { PreguntaService } from '../../../preguntas/services/pregunta.service';
import { JerarquiaService } from '../../../../core/services/jerarquia.service';
import { ExamenService } from '../../services/examen.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';

// Models
import { Pregunta } from '../../../../core/models/pregunta.model';
import { ModuloJerarquia, ResultadoAprendizaje } from '../../../../core/models/jerarquia.model';
import { Examen } from '../../../../core/models/examen.model';

@Component({
  selector: 'app-crear-examen',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-examen.component.html',
  styleUrls: ['./crear-examen.component.scss']
})
export class CrearExamenComponent implements OnInit {
  // Form
  examenForm!: FormGroup;

  // Data
  modulos: ModuloJerarquia[] = [];
  todasLasPreguntas: Pregunta[] = [];
  preguntasFiltradas: Pregunta[] = [];
  preguntasSeleccionadas: Set<string> = new Set();

  // Filters
  filtroTexto: string = '';
  filtroModulo: string = '';
  filtroRA: string = '';
  rasDisponibles: ResultadoAprendizaje[] = [];

  // Loading state
  cargando: boolean = true;
  guardando: boolean = false;

  // Modal states
  modalCancelarVisible: boolean = false;

  // Edit mode
  modoEdicion: boolean = false;
  examenId?: string;

  constructor(
    private fb: FormBuilder,
    private preguntaService: PreguntaService,
    private jerarquiaService: JerarquiaService,
    private examenService: ExamenService,
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.suscribirseACambiosDeOpciones(); // Nuevo
    this.cargarDatosIniciales();
    this.verificarModoEdicion();
  }

  private inicializarFormulario(): void {
    this.examenForm = this.fb.group({
      titulo: ['', Validators.required],
      asignatura: ['', Validators.required],
      duracion: [60, [Validators.required, Validators.min(5), Validators.max(60)]], // Max 60
      intentos: [1, [Validators.required, Validators.min(1)]],
      opciones: this.fb.group({
        aleatorio: [false],
        respuestas_inmediatas: [false],
        limite_tiempo: [true],
        navegacion_libre: [false]
      })
    });
  }

  private suscribirseACambiosDeOpciones(): void {
    const limiteTiempoControl = this.examenForm.get('opciones.limite_tiempo');
    const duracionControl = this.examenForm.get('duracion');

    if (limiteTiempoControl && duracionControl) {
      limiteTiempoControl.valueChanges.subscribe((tieneLimite: boolean) => {
        if (tieneLimite) {
          duracionControl.enable();
          duracionControl.setValidators([Validators.required, Validators.min(5), Validators.max(60)]);
        } else {
          duracionControl.disable();
          duracionControl.clearValidators();
          duracionControl.setValue(0); // O null, indicando sin límite
        }
        duracionControl.updateValueAndValidity();
      });
    }
  }

  private verificarModoEdicion(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicion = true;
      this.examenId = id;
      this.cargarExamen(id);
    }
  }

  private cargarExamen(id: string): void {
    this.examenService.obtenerExamenPorId(id).subscribe({
      next: (examen) => {
        // Prepare options values
        const opciones = {
          aleatorio: examen.opciones?.aleatorio ?? false,
          respuestas_inmediatas: examen.opciones?.respuestas_inmediatas ?? false,
          limite_tiempo: examen.opciones?.limite_tiempo ?? true, // Default true for legacy
          navegacion_libre: examen.opciones?.navegacion_libre ?? false
        };

        this.examenForm.patchValue({
          titulo: examen.titulo,
          asignatura: examen.asignatura,
          duracion: examen.duracion,
          intentos: examen.intentos,
          opciones: opciones
        });

        // Force update of duration state based on loaded option
        const duracionControl = this.examenForm.get('duracion');
        if (!opciones.limite_tiempo && duracionControl) {
          duracionControl.disable();
          duracionControl.clearValidators();
        }

        // Set selected questions
        if (examen.preguntas && Array.isArray(examen.preguntas)) {
          examen.preguntas.forEach(id => this.preguntasSeleccionadas.add(id));
        }

        // Set filters
        this.filtroModulo = examen.asignatura;
        this.onModuloChange();
      },
      error: (err) => {
        console.error('Error loading exam:', err);
        this.notificacionService.mostrar('Error al cargar el examen', 'error');
      }
    });
  }

  private cargarDatosIniciales(): void {
    this.cargando = true;

    // Load modules/RAs
    this.jerarquiaService.getJerarquia().subscribe({
      next: (modulos) => {
        this.modulos = modulos;
      },
      error: (err) => console.error('Error loading modules:', err)
    });

    // Load all questions
    this.cargarPreguntas();
  }

  cargarPreguntas(): void {
    this.preguntaService.buscarPreguntas({}).subscribe({
      next: (preguntas) => {
        this.todasLasPreguntas = preguntas;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error loading questions:', err);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.todasLasPreguntas];

    // Filter by text
    if (this.filtroTexto.trim()) {
      const textoLower = this.filtroTexto.toLowerCase();
      resultado = resultado.filter(p =>
        p.enunciado.toLowerCase().includes(textoLower)
      );
    }

    // Filter by module
    if (this.filtroModulo) {
      resultado = resultado.filter(p => p.asignatura === this.filtroModulo);
    }

    // Filter by RA
    if (this.filtroRA) {
      resultado = resultado.filter(p => p.tema === this.filtroRA);
    }

    this.preguntasFiltradas = resultado;
  }

  onModuloChange(): void {
    // Reset RA filter when module changes
    this.filtroRA = '';

    // Update available RAs based on selected module
    if (this.filtroModulo) {
      const moduloSeleccionado = this.modulos.find(m => m.nombre === this.filtroModulo);
      this.rasDisponibles = moduloSeleccionado?.ras || [];
    } else {
      this.rasDisponibles = [];
    }

    this.aplicarFiltros();
  }

  togglePregunta(id: string | undefined): void {
    if (!id) return;

    if (this.preguntasSeleccionadas.has(id)) {
      this.preguntasSeleccionadas.delete(id);
    } else {
      this.preguntasSeleccionadas.add(id);
    }
  }

  estaSeleccionada(id: string | undefined): boolean {
    if (!id) return false;
    return this.preguntasSeleccionadas.has(id);
  }

  getClaseDificultad(dificultad: any): string {
    const nivel = parseInt(String(dificultad), 10);
    if (nivel === 0) return 'insignia-exito';
    if (nivel === 1) return 'insignia-advertencia';
    if (nivel >= 2) return 'insignia-peligro';
    return 'insignia';
  }

  getDificultadTexto(dificultad: any): string {
    const nivel = parseInt(String(dificultad), 10);
    if (nivel === 0) return 'FÁCIL';
    if (nivel === 1) return 'MEDIA';
    if (nivel >= 2) return 'DIFÍCIL';
    return 'N/A';
  }

  /**
   * Check if initial form fields are complete
   * Required fields: titulo, asignatura, duracion
   */
  formularioInicialCompleto(): boolean {
    const titulo = this.examenForm.get('titulo')?.value;
    const asignatura = this.examenForm.get('asignatura')?.value;
    const duracion = this.examenForm.get('duracion')?.value;
    const tieneLimite = this.examenForm.get('opciones.limite_tiempo')?.value;

    if (!tieneLimite) {
      return !!(titulo && asignatura);
    }
    return !!(titulo && asignatura && duracion);
  }

  // ============================================================================
  // FORM SUBMISSION METHODS
  // ============================================================================

  guardarBorrador(): void {
    if (!this.validarFormulario()) return;
    this.guardarExamen('borrador');
  }

  crearYPublicar(): void {
    if (!this.validarFormulario()) return;
    this.guardarExamen('publicado');
  }

  private validarFormulario(): boolean {
    if (this.examenForm.invalid) {
      this.notificacionService.mostrar('Por favor, completa todos los campos requeridos', 'error');
      Object.keys(this.examenForm.controls).forEach(key => {
        this.examenForm.get(key)?.markAsTouched();
      });
      return false;
    }

    if (this.preguntasSeleccionadas.size === 0) {
      this.notificacionService.mostrar('Debes seleccionar al menos una pregunta', 'error');
      return false;
    }

    return true;
  }

  private guardarExamen(estado: 'borrador' | 'publicado'): void {
    this.guardando = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.notificacionService.mostrar('Usuario no autenticado', 'error');
      this.guardando = false;
      return;
    }

    // Get RAs from selected questions
    const preguntasSeleccionadasArray = Array.from(this.preguntasSeleccionadas);
    const rasSet = new Set<string>();

    preguntasSeleccionadasArray.forEach(preguntaId => {
      const pregunta = this.todasLasPreguntas.find(p => p._id === preguntaId);
      if (pregunta && pregunta.tema) {
        rasSet.add(pregunta.tema);
      }
    });

    const examenData: Examen = {
      titulo: this.examenForm.value.titulo,
      asignatura: this.examenForm.value.asignatura,
      ras: Array.from(rasSet),
      duracion: this.examenForm.value.duracion,
      intentos: this.examenForm.value.intentos,
      preguntas: preguntasSeleccionadasArray,
      opciones: this.examenForm.value.opciones,
      estado: estado,
      creador: currentUser.id
    };

    const operacion = this.modoEdicion && this.examenId
      ? this.examenService.actualizarExamen(this.examenId, examenData)
      : this.examenService.crearExamen(examenData);

    operacion.subscribe({
      next: () => {
        const mensaje = this.modoEdicion
          ? `Examen actualizado como ${estado}`
          : `Examen creado como ${estado}`;
        this.notificacionService.mostrar(mensaje);
        this.guardando = false;

        // Navigate to appropriate page
        if (estado === 'publicado') {
          this.router.navigate(['/examenes']);
        } else {
          this.router.navigate(['/examenes/borradores']);
        }
      },
      error: (err) => {
        console.error('Error saving exam:', err);
        this.notificacionService.mostrar('Error al guardar el examen', 'error');
        this.guardando = false;
      }
    });
  }

  // ============================================================================
  // CANCEL LOGIC
  // ============================================================================

  mostrarModalCancelar(): void {
    this.modalCancelarVisible = true;
  }

  cerrarModalCancelar(): void {
    this.modalCancelarVisible = false;
  }

  confirmarCancelacion(): void {
    this.cerrarModalCancelar();
    this.router.navigate(['/examenes']);
  }
}