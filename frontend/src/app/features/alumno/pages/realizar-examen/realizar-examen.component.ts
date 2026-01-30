import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

// Services
import { ExamenService } from '../../../../features/examenes/services/examen.service';
import { PreguntaService } from '../../../../features/preguntas/services/pregunta.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';

// Models
import { Examen } from '../../../../core/models/examen.model';
import { Pregunta } from '../../../../core/models/pregunta.model';

@Component({
  selector: 'app-realizar-examen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './realizar-examen.component.html',
  styleUrls: ['./realizar-examen.component.scss']
})
export class RealizarExamenComponent implements OnInit, OnDestroy {
  examen: Examen | null = null;
  preguntas: Pregunta[] = [];
  studentName: string = 'Alumno';

  currentQuestionIndex: number = 0;
  answers: { [key: string]: number } = {}; // questionId -> answerIndex

  timeLeft: number = 0; // seconds
  timerInterval: any;
  loading: boolean = true;
  mostrarModalConfirmacion: boolean = false;
  mostrarModalResultados: boolean = false; // Nuevo: Modal de Resultados
  resultadoExamen = { aciertos: 0, total: 0, nota: 0 }; // Nuevo: Estado de resultados

  tieneLimite: boolean = true; // Nuevo: Control de límite de tiempo

  // Para mostrar letras en lugar de índices (A, B, C, D)
  letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examenService: ExamenService,
    private preguntaService: PreguntaService,
    private notificacionService: NotificacionService,
    private location: Location
  ) { }

  ngOnInit(): void {
    // Recuperar nombre del alumno del estado de navegación
    const state = history.state;
    if (state && state.studentName) {
      this.studentName = state.studentName;
    }

    // Obtener ID del examen de los query params
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadExam(id);
      } else {
        this.notificacionService.mostrar('No se especificó un examen', 'error');
        this.router.navigate(['/alumno/acceso']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadExam(id: string): void {
    this.loading = true;
    this.examenService.obtenerExamenPorId(id).subscribe({
      next: (exam) => {
        this.examen = exam;

        // Configurar temporizador
        this.tieneLimite = exam.opciones?.limite_tiempo ?? true;

        if (this.tieneLimite) {
          this.timeLeft = (exam.duracion || 60) * 60;
          this.startTimer();
        } else {
          // Sin límite de tiempo, no iniciamos temporizador
          this.timeLeft = 0;
        }

        // Robust question loading
        if (exam.preguntas && exam.preguntas.length > 0) {
          const firstQ = exam.preguntas[0];
          // Check if it's an object (populated) or string (ID)
          if (typeof firstQ === 'object' && firstQ !== null) {
            this.preguntas = exam.preguntas as unknown as Pregunta[];
            this.loading = false;
          } else {
            // Assuming it's ID string
            const requests = (exam.preguntas as unknown as string[]).map(qId =>
              this.preguntaService.obtenerPregunta(qId)
            );
            forkJoin(requests).subscribe({
              next: (questions) => {
                this.preguntas = questions;
                this.loading = false;
              },
              error: (err) => {
                console.error('Error loading questions detail:', err);
                this.loading = false;
                this.notificacionService.mostrar('Error al cargar las preguntas', 'error');
              }
            });
          }
        } else {
          this.loading = false;
          this.notificacionService.mostrar('El examen no tiene preguntas', 'error');
        }
      },
      error: (err) => {
        console.error('Error loading exam:', err);
        this.loading = false;
        this.notificacionService.mostrar('Error al cargar el examen', 'error');
        this.router.navigate(['/alumno/acceso']);
      }
    });
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        if (this.timeLeft === 300) {
          this.notificacionService.mostrar('¡Atención! Quedan 5 minutos para finalizar.', 'error');
        }
      } else {
        clearInterval(this.timerInterval);
        this.finalizarExamen(true);
      }
    }, 1000);
  }

  formatearTiempo(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get preguntaActual(): Pregunta | null {
    if (!this.preguntas || this.preguntas.length === 0) return null;
    return this.preguntas[this.currentQuestionIndex];
  }

  get preguntasRespondidas(): number {
    return Object.keys(this.answers).length;
  }

  seleccionarRespuesta(preguntaId: string | undefined, opcionIndex: number): void {
    if (!preguntaId) return;
    this.answers[preguntaId] = opcionIndex;
  }

  esRespuestaSeleccionada(preguntaId: string | undefined, opcionIndex: number): boolean {
    if (!preguntaId) return false;
    return this.answers[preguntaId] === opcionIndex;
  }

  anterior(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  siguiente(): void {
    if (this.currentQuestionIndex < this.preguntas.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.notificacionService.mostrar('Fin de preguntas alcanzado', 'error');
    }
  }

  pedirConfirmacionFinalizar(): void {
    this.mostrarModalConfirmacion = true;
  }

  cancelarFinalizar(): void {
    this.mostrarModalConfirmacion = false;
  }

  confirmarFinalizar(): void {
    this.mostrarModalConfirmacion = false;
    this.finalizarExamen();
  }

  cerrarModalResultados(): void {
    this.mostrarModalResultados = false;
    this.router.navigate(['/alumno/acceso']);
  }

  finalizarExamen(porTiempo: boolean = false): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    if (porTiempo) {
      this.notificacionService.mostrar('El tiempo ha finalizado. Calculando resultados...', 'error');
    }

    // Calcular resultado (Simulación frontend)
    let aciertos = 0;
    let total = this.preguntas.length;

    this.preguntas.forEach(p => {
      // Comparison: p.respuesta_correcta is number index
      if (p._id && this.answers[p._id] === p.respuesta_correcta) {
        aciertos++;
      }
    });

    const nota = total > 0 ? (aciertos / total) * 10 : 0;

    // Guardar resultados para mostrar en el modal
    this.resultadoExamen = {
      aciertos,
      total,
      nota
    };

    // Mostrar modal en lugar de alert
    this.mostrarModalResultados = true;
  }
}