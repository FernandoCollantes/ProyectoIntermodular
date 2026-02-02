import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule as NgCommonModule } from '@angular/common';

// Services
import { ExamenService } from '../../../../features/examenes/services/examen.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';

@Component({
  selector: 'app-realizar-examen',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './realizar-examen.component.html',
  styleUrls: ['./realizar-examen.component.scss']
})
export class RealizarExamenComponent implements OnInit, OnDestroy {
  examen: any | null = null;
  preguntas: any[] = [];
  studentName: string = '';
  studentEmail: string = '';
  token: string | null = null;
  sesionId: string | null = null;

  currentQuestionIndex: number = 0;
  answers: { [key: string]: number } = {}; // questionId -> answerIndex

  loading: boolean = true;
  mostrarModalConfirmacion: boolean = false;
  mostrarModalResultados: boolean = false;
  resultadoExamen = { aciertos: 0, total: 0, nota: 0 };
  tieneLimite: boolean = false;
  timeLeft: number = 0; // en segundos
  timerInterval: any;
  ultimoIntentoId: string | null = null;

  // Para mostrar letras en lugar de índices (A, B, C, D)
  letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examenService: ExamenService,
    private notificacionService: NotificacionService
  ) { }

  ngOnInit(): void {
    const state = history.state;
    if (state && state.studentName && state.studentEmail) {
      this.studentName = state.studentName;
      this.studentEmail = state.studentEmail;
    } else {
      this.notificacionService.mostrar('Por favor, introduce tus datos para comenzar', 'error');
      this.router.navigate(['/alumno/acceso']);
      return;
    }

    this.route.params.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.loadSesion(this.token);
      } else {
        this.notificacionService.mostrar('Acceso denegado: Token no proporcionado', 'error');
        this.router.navigate(['/alumno/acceso']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadSesion(token: string): void {
    this.loading = true;
    this.examenService.obtenerSesionPorToken(token).subscribe({
      next: (data) => {
        this.sesionId = data.sesion_id;
        this.examen = data;
        this.preguntas = data.preguntas;
        this.loading = false;

        if (this.examen.duracion) {
          this.tieneLimite = true;
          this.timeLeft = this.examen.duracion * 60;
          this.startTimer();
        }
      },
      error: (err: any) => {
        this.notificacionService.mostrar('Error al cargar la sesión: ' + err.message, 'error');
        this.router.navigate(['/alumno/acceso']);
      }
    });
  }



  get preguntaActual(): any | null {
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

  finalizarExamen(): void {
    const answersList = Object.keys(this.answers).map(qId => ({
      preguntaId: qId,
      valor: this.answers[qId]
    }));

    const studentData = { nombre: this.studentName, email: this.studentEmail };

    this.examenService.enviarResultadosSesion(this.sesionId!, studentData, answersList).subscribe({
      next: (res: any) => {
        this.resultadoExamen = {
          aciertos: res.result.aciertos,
          total: res.result.total,
          nota: parseFloat(res.result.nota)
        };
        this.ultimoIntentoId = res.result.intentoId;
        this.mostrarModalResultados = true;
      },
      error: (err: any) => {
        this.notificacionService.mostrar('Error al enviar resultados: ' + err.message, 'error');
      }
    });
  }

  cerrarModalResultados(): void {
    this.mostrarModalResultados = false;
    this.router.navigate(['/alumno/acceso']);
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.finalizarExamen();
      }
    }, 1000);
  }

  formatearTiempo(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}