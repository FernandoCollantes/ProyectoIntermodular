import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Services
import { ExamenService } from '../../services/examen.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

// Models
import { Examen } from '../../../../core/models/examen.model';

@Component({
    selector: 'app-borradores',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './borradores.component.html',
    styleUrls: ['./borradores.component.scss']
})
export class BorradoresComponent implements OnInit {
    borradores: Examen[] = [];
    borradoresTodos: Examen[] = [];
    cargando: boolean = true;
    terminoBusqueda: string = '';

    // Modal states (using ConfirmationService instead)
    idExamenSeleccionado: string | null = null;

    constructor(
        private examenService: ExamenService,
        private authService: AuthService,
        private notificacionService: NotificacionService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarBorradores();
    }

    cargarBorradores(): void {
        this.cargando = true;
        const currentUser = this.authService.getCurrentUser();

        if (!currentUser) {
            this.notificacionService.mostrar('Usuario no autenticado', 'error');
            this.cargando = false;
            return;
        }

        this.examenService.obtenerBorradores(currentUser.id).subscribe({
            next: (borradores) => {
                this.borradoresTodos = borradores;
                this.aplicarFiltros();
                this.cargando = false;
            },
            error: (err) => {
                console.error('Error loading drafts:', err);
                this.notificacionService.mostrar('Error al cargar los borradores', 'error');
                this.cargando = false;
            }
        });
    }

    aplicarFiltros(): void {
        if (this.terminoBusqueda.trim()) {
            const textoLower = this.terminoBusqueda.toLowerCase();
            this.borradores = this.borradoresTodos.filter(e =>
                e.titulo.toLowerCase().includes(textoLower) ||
                e.asignatura.toLowerCase().includes(textoLower)
            );
        } else {
            this.borradores = [...this.borradoresTodos];
        }
    }

    editarBorrador(id: string | undefined): void {
        if (id) {
            this.router.navigate(['/examenes/editar', id]);
        }
    }

    async eliminarBorrador(id: string | undefined): Promise<void> {
        if (!id) return;

        const confirmar = await this.confirmationService.confirm({
            title: '¿Eliminar borrador?',
            message: 'Esta acción eliminará el borrador de forma permanente y no se podrá deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmar) return;

        this.examenService.eliminarExamen(id).subscribe({
            next: () => {
                this.notificacionService.mostrar('Borrador eliminado con éxito');
                this.cargarBorradores();
            },
            error: (err) => {
                console.error('Error deleting draft:', err);
                this.notificacionService.mostrar('No se pudo eliminar el borrador', 'error');
            }
        });
    }

    async publicarBorrador(id: string | undefined): Promise<void> {
        if (!id) return;

        const confirmar = await this.confirmationService.confirm({
            title: '¿Publicar examen?',
            message: 'El examen estará disponible para los alumnos. ¿Deseas publicarlo ahora?',
            confirmText: 'Sí, publicar',
            cancelText: 'Cancelar',
            type: 'info'
        });

        if (!confirmar) return;

        this.examenService.publicarExamen(id).subscribe({
            next: () => {
                this.notificacionService.mostrar('Examen publicado con éxito');
                this.cargarBorradores();
            },
            error: (err) => {
                console.error('Error publishing exam:', err);
                this.notificacionService.mostrar('No se pudo publicar el examen', 'error');
            }
        });
    }

    cerrarModal(): void {
        this.idExamenSeleccionado = null;
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
