import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Services
import { ExamenService } from '../../services/examen.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';

// Models
import { Examen } from '../../../../core/models/examen.model';

@Component({
  selector: 'app-mis-examenes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-examenes.component.html',
  styleUrls: ['./mis-examenes.component.scss']
})
export class MisExamenesComponent implements OnInit {
  examenes: Examen[] = [];
  examenesTodas: Examen[] = [];
  cargando: boolean = true;
  terminoBusqueda: string = '';

  // Modal states
  modalEliminarVisible: boolean = false;
  idExamenAEliminar: string | null = null;

  constructor(
    private examenService: ExamenService,
    private authService: AuthService,
    private notificacionService: NotificacionService,
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

  eliminarExamen(id: string | undefined): void {
    if (!id) return;
    this.idExamenAEliminar = id;
    this.modalEliminarVisible = true;
  }

  cerrarModal(): void {
    this.modalEliminarVisible = false;
    this.idExamenAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.idExamenAEliminar) return;

    this.examenService.eliminarExamen(this.idExamenAEliminar).subscribe({
      next: () => {
        this.notificacionService.mostrar('Examen eliminado con éxito');
        this.cargarExamenes();
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error deleting exam:', err);
        this.notificacionService.mostrar('No se pudo eliminar el examen', 'error');
        this.cerrarModal();
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
}