import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamenService } from '../../services/examen.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
    selector: 'app-examenes-realizados',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './examenes-realizados.component.html',
    styleUrls: ['./examenes-realizados.component.scss']
})
export class ExamenesRealizadosComponent implements OnInit {
    sesiones: any[] = [];
    loading: boolean = true;

    constructor(
        private examenService: ExamenService,
        private authService: AuthService,
        private notificacionService: NotificacionService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.cargarSesiones();
    }

    cargarSesiones(): void {
        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.loading = true;
        this.examenService.obtenerSesionesConResultados(user.id).subscribe({
            next: (data) => {
                this.sesiones = data;
                this.loading = false;
            },
            error: (err: any) => {
                this.notificacionService.mostrar('Error al cargar resultados: ' + err.message, 'error');
                this.loading = false;
            }
        });
    }

    async eliminarSesion(sesionId: string): Promise<void> {
        const confirmar = await this.confirmationService.confirm({
            title: '¿Eliminar registro de examen?',
            message: 'Se borrarán todos los resultados de los alumnos asociados. Esta acción no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmar) return;

        this.examenService.eliminarSesion(sesionId).subscribe({
            next: () => {
                this.notificacionService.mostrar('Registro eliminado correctamente', 'exito');
                this.sesiones = this.sesiones.filter(s => s._id !== sesionId);
            },
            error: (err: any) => {
                this.notificacionService.mostrar('Error al eliminar: ' + err.message, 'error');
            }
        });
    }

    formatearFecha(fecha: any): string {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getNotaClass(nota: number): string {
        if (nota >= 7) return 'nota-alta';
        if (nota >= 5) return 'nota-media';
        return 'nota-baja';
    }
}
