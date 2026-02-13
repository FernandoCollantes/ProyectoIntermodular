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
import { ConfirmationService } from '../../../../core/services/confirmation.service';

// Models
import { Pregunta } from '../../../../core/models/pregunta.model';
import { ModuloJerarquia, ResultadoAprendizaje } from '../../../../core/models/jerarquia.model';
import { Examen } from '../../../../core/models/examen.model';
import { HasPendingChanges } from '../../../../core/guards/pending-changes.guard';

@Component({
  selector: 'app-crear-examen',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-examen.component.html',
  styleUrls: ['./crear-examen.component.scss']
})
export class CrearExamenComponent implements OnInit, HasPendingChanges {
  // Form
  examenForm!: FormGroup;

  // Data
  modulos: ModuloJerarquia[] = [];
  todasLasPreguntas: Pregunta[] = [];
  preguntasFiltradas: Pregunta[] = [];
  preguntasSeleccionadas: Set<string> = new Set();
  metodoSeleccion: 'manual' | 'aleatorio' = 'manual';
  cantidadAleatoria: number = 5;

  // Filters
  filtroTexto: string = '';
  filtroModulo: string = '';
  filtrosRA: string[] = [];
  filtroRATexto: string = ''; // Nuevo: para filtrar los chips de RA
  rasDisponibles: ResultadoAprendizaje[] = [];

  get rasFiltrados(): ResultadoAprendizaje[] {
    if (!this.filtroRATexto.trim()) return this.rasDisponibles;
    const term = this.filtroRATexto.toLowerCase();
    return this.rasDisponibles.filter(ra =>
      ra.codigo.toLowerCase().includes(term) ||
      ra.texto.toLowerCase().includes(term)
    );
  }

  get preguntasSeleccionadasLista(): Pregunta[] {
    return this.todasLasPreguntas.filter(p => this.preguntasSeleccionadas.has(p._id!));
  }

  // Loading state
  cargando: boolean = true;
  guardando: boolean = false;

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
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarDatosIniciales();
    this.verificarModoEdicion();
  }

  private inicializarFormulario(): void {
    this.examenForm = this.fb.group({
      titulo: ['', Validators.required],
      asignatura: ['', Validators.required],
      duracion: [60, [Validators.required, Validators.min(5), Validators.max(60)]]
    });
  }

  hasPendingChanges(): boolean {
    if (this.guardando) return false;
    return this.examenForm.dirty || this.preguntasSeleccionadas.size > 0;
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
        this.examenForm.patchValue({
          titulo: examen.titulo,
          asignatura: examen.asignatura,
          duracion: examen.duracion
        });



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
    const subject = this.examenForm.get('asignatura')?.value;

    this.preguntaService.buscarPreguntas({ subject }).subscribe({
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

    // Filter by module - Now handled by backend in cargarPreguntas()
    // but we can keep it for extra safety or if todasLasPreguntas contains everything
    if (this.filtroModulo) {
      resultado = resultado.filter(p =>
        p.asignatura.toLowerCase().trim() === this.filtroModulo.toLowerCase().trim()
      );
    }

    // Filter by RAs (Multi-selection)
    if (this.filtrosRA.length > 0) {
      resultado = resultado.filter(p => {
        // Robustez: Asegurar que tema sea un array antes de usar some()
        const temas = Array.isArray(p.tema) ? p.tema : (p.tema ? [String(p.tema)] : []);
        return this.filtrosRA.some(f => temas.includes(f));
      });
    }

    this.preguntasFiltradas = resultado;
  }

  onModuloChange(): void {
    const selectedModulo = this.examenForm.get('asignatura')?.value;
    this.filtroModulo = selectedModulo;

    // Reset RA filter when module changes
    this.filtrosRA = [];

    // Update available RAs based on selected module
    if (this.filtroModulo) {
      const moduloSeleccionado = this.modulos.find(m => m.nombre === this.filtroModulo);
      this.rasDisponibles = moduloSeleccionado?.ras || [];
    } else {
      this.rasDisponibles = [];
    }

    // Al cambiar el módulo, recargamos las preguntas desde el backend para este módulo específicamente
    this.cargarPreguntas();
  }

  toggleRA(codigo: string): void {
    const index = this.filtrosRA.indexOf(codigo);
    if (index > -1) {
      this.filtrosRA.splice(index, 1);
    } else {
      this.filtrosRA.push(codigo);
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

  generarPreguntasAleatorias(): void {
    const asignatura = this.examenForm.get('asignatura')?.value;
    if (!asignatura) {
      this.notificacionService.mostrar('Selecciona una asignatura primero', 'error');
      return;
    }

    this.cargando = true;
    this.examenService.generarPreview({
      subjectId: asignatura,
      amount: this.cantidadAleatoria
    }).subscribe({
      next: (examenAleatorio) => {
        if (examenAleatorio && examenAleatorio.preguntas) {
          // Limpiar selección previa si se desea, o añadir a la existente. 
          // Según el requerimiento "generarte el examen aleatoriamente", suele implicar un nuevo conjunto.
          this.preguntasSeleccionadas.clear();

          examenAleatorio.preguntas.forEach((p: any) => {
            // El backend devuelve objetos completos en el preview, necesitamos los IDs
            const id = typeof p === 'string' ? p : p._id;
            if (id) this.preguntasSeleccionadas.add(id);
          });

          this.notificacionService.mostrar(`Se han generado ${this.preguntasSeleccionadas.size} preguntas aleatorias`);
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error generando preguntas aleatorias:', err);
        this.notificacionService.mostrar('Error al generar preguntas aleatorias: ' + (err.error?.message || err.message), 'error');
        this.cargando = false;
      }
    });
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

    return !!(titulo && asignatura && duracion >= 5);
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
        // Robustez: Asegurar que tema sea un array antes de usar forEach()
        const temas = Array.isArray(pregunta.tema) ? pregunta.tema : [String(pregunta.tema)];
        temas.forEach(t => rasSet.add(t));
      }
    });

    const examenData: Examen = {
      titulo: this.examenForm.value.titulo,
      asignatura: this.examenForm.value.asignatura,
      duracion: this.examenForm.value.duracion,
      ras: Array.from(rasSet),
      preguntas: preguntasSeleccionadasArray,
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
        // Desactiva el flag guardando se mantiene en true para evitar que el PendingChangesGuard
        // salte durante la navegación inmediata

        // Navigate to appropriate page
        if (estado === 'publicado') {
          this.router.navigate(['/examenes']);
        } else {
          this.router.navigate(['/examenes/borradores']);
        }
      },
      error: (err) => {
        console.error('Error saving exam:', err);
        const mensajeError = err.error?.message || 'Error al guardar el examen';
        this.notificacionService.mostrar(mensajeError, 'error');
        this.guardando = false;
      }
    });
  }

  // ============================================================================
  // CANCEL LOGIC
  // ============================================================================

  async confirmarCancelacion(): Promise<void> {
    const hasData = this.examenForm.dirty || this.preguntasSeleccionadas.size > 0;

    if (hasData) {
      const confirmar = await this.confirmationService.confirm({
        title: '¿Cancelar creación?',
        message: 'Se perderán todos los datos introducidos y la selección de preguntas.',
        confirmText: 'Sí, cancelar',
        cancelText: 'No, continuar',
        type: 'warning'
      });

      if (confirmar) {
        this.router.navigate(['/examenes']);
      }
    } else {
      this.router.navigate(['/examenes']);
    }
  }
}