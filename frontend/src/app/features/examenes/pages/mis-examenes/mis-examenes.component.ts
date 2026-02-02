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
import { JerarquiaService } from '../../../../core/services/jerarquia.service';

// Models
import { Examen, DownloadExamDto } from '../../../../core/models';
import { ModuloJerarquia, ResultadoAprendizaje } from '../../../../core/models/jerarquia.model';

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

  // Filtros
  listaModulosXML: ModuloJerarquia[] = [];
  rasDisponibles: ResultadoAprendizaje[] = [];
  filtroModulo: string = '';
  filtroRA: string = '';

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
    private jerarquiaService: JerarquiaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.cargando = true;

    // 1. Cargamos la jerarquía desde el XML
    this.jerarquiaService.getJerarquia().subscribe({
      next: (modulos) => {
        this.listaModulosXML = modulos;
        // 2. Cargamos los exámenes después de tener la jerarquía (aunque no dependen estrictamente, es mejor orden)
        this.cargarExamenes();
      },
      error: () => {
        this.notificacionService.mostrar('Error al leer el archivo XML', 'error');
        this.cargarExamenes(); // Intentamos cargar exámenes de todas formas
      }
    });
  }

  cargarExamenes(): void {
    this.cargando = true;

    this.examenService.obtenerExamenes().subscribe({
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

  seleccionarModulo(nombreModulo: string): void {
    this.filtroModulo = nombreModulo;
    this.filtroRA = ''; // Reset RA when module changes

    if (nombreModulo) {
      const modulo = this.listaModulosXML.find(m => m.nombre === nombreModulo);
      this.rasDisponibles = modulo?.ras || [];
    } else {
      this.rasDisponibles = [];
    }

    this.aplicarFiltros();
  }

  seleccionarRA(codigo: string): void {
    // Toggle RA check
    if (this.filtroRA === codigo) {
      this.filtroRA = '';
    } else {
      this.filtroRA = codigo;
    }
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let resultados = [...this.examenesTodas];

    // 1. Filtro por Módulo (Asignatura)
    if (this.filtroModulo) {
      resultados = resultados.filter(e => e.asignatura === this.filtroModulo);
    }

    // 2. Filtro por RA/Tema - Checking if the selected RA is in the exam's RAs array
    if (this.filtroRA) {
      resultados = resultados.filter(e => e.ras && e.ras.includes(this.filtroRA));
    }

    // 3. Búsqueda por texto (Título)
    if (this.terminoBusqueda.trim()) {
      const textoLower = this.terminoBusqueda.toLowerCase();
      resultados = resultados.filter(e =>
        e.titulo.toLowerCase().includes(textoLower)
      );
    }

    this.examenes = resultados;
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