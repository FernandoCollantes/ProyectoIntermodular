import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

// Components
import { CompartirExamenComponent } from '../../components/compartir-examen.component';

// Services
import { ExamenService } from '../../services/examen.service';
import { PreguntaService } from '../../../preguntas/services/pregunta.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

// Models
import { Examen, DownloadExamDto } from '../../../../core/models';

@Component({
  selector: 'app-mis-examenes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CompartirExamenComponent],
  templateUrl: './mis-examenes.component.html',
  styleUrls: ['./mis-examenes.component.scss']
})
export class MisExamenesComponent implements OnInit {
  examenes: Examen[] = [];
  examenesTodas: Examen[] = [];
  cargando: boolean = true;
  terminoBusqueda: string = '';

  // States
  descargandoIds: Set<string> = new Set();

  // Modal states
  modalEliminarVisible: boolean = false;
  idExamenAEliminar: string | null = null;

  modalCompartirVisible: boolean = false;
  examenACompartir: Examen | null = null;

  constructor(
    private examenService: ExamenService,
    private preguntaService: PreguntaService,
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarExamenes();
  }

  cargarExamenes(): void {
    this.cargando = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.notificacionService.mostrar('Usuario no autenticado', 'error');
      this.cargando = false;
      return;
    }

    this.examenService.obtenerExamenes(currentUser.id).subscribe({
      next: (examenes) => {
        this.examenesTodas = examenes;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error loading exams:', err);
        this.notificacionService.mostrar('Error al cargar los exámenes', 'error');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    if (this.terminoBusqueda.trim()) {
      const textoLower = this.terminoBusqueda.toLowerCase();
      this.examenes = this.examenesTodas.filter(e =>
        e.titulo.toLowerCase().includes(textoLower) ||
        e.asignatura.toLowerCase().includes(textoLower)
      );
    } else {
      this.examenes = [...this.examenesTodas];
    }
  }

  editarExamen(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/examenes/editar', id]);
    }
  }

  async eliminarExamen(id: string | undefined): Promise<void> {
    if (!id) return;

    const confirmar = await this.confirmationService.confirm({
      title: '¿Eliminar examen?',
      message: 'Esta acción eliminará el examen de forma permanente y no se podrá deshacer.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmar) return;

    this.examenService.eliminarExamen(id).subscribe({
      next: () => {
        this.notificacionService.mostrar('Examen eliminado con éxito');
        this.cargarExamenes();
      },
      error: (err) => {
        console.error('Error deleting exam:', err);
        this.notificacionService.mostrar('No se pudo eliminar el examen', 'error');
      }
    });
  }

  formatearFecha(fecha: Date | undefined): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getCantidadPreguntas(examen: Examen): number {
    return examen.preguntas?.length || 0;
  }

  abrirCompartir(examen: Examen): void {
    if (!examen._id) return;
    this.examenACompartir = examen;
    this.modalCompartirVisible = true;
  }

  cerrarCompartir(): void {
    this.modalCompartirVisible = false;
    this.examenACompartir = null;
  }

  isDescargando(examen: Examen): boolean {
    return !!examen._id && this.descargandoIds.has(examen._id);
  }

  descargarPDF(examen: Examen): void {
    if (!examen._id || this.descargandoIds.has(examen._id)) return;
    if (!examen.preguntas || examen.preguntas.length === 0) {
      this.notificacionService.mostrar('El examen no tiene preguntas para exportar', 'error');
      return;
    }

    this.descargandoIds.add(examen._id);
    this.notificacionService.mostrar('Generando PDF...', 'exito');

    // 1. Fetch all questions details
    // Ensure we handle both string IDs and populated objects safely
    const questionIds = (examen.preguntas as unknown as any[]).map(q =>
      typeof q === 'string' ? q : q._id
    ).filter(id => !!id);

    const requests = questionIds.map(qId =>
      this.preguntaService.obtenerPregunta(qId)
    );

    forkJoin(requests).subscribe({
      next: (preguntas) => {
        // 2. Prepare DTO
        const dto: DownloadExamDto = {
          nombre: examen.titulo,
          fecha_creacion: new Date(),
          preguntas: preguntas
        };

        // 3. Call download service
        this.examenService.descargarPdf(dto).subscribe({
          next: (blob) => {
            this.examenService.guardarArchivo(blob, `${examen.titulo.replace(/\s+/g, '_')}.pdf`);
            this.descargandoIds.delete(examen._id!);
            this.notificacionService.mostrar('PDF descargado correctamente');
          },
          error: (err) => {
            console.error('Error generating PDF:', err);
            this.notificacionService.mostrar('Error al generar el PDF', 'error');
            this.descargandoIds.delete(examen._id!);
          }
        });
      },
      error: (err) => {
        console.error('Error loading questions for PDF:', err);
        this.notificacionService.mostrar('Error al obtener datos del examen', 'error');
        this.descargandoIds.delete(examen._id!);
      }
    });
  }
}