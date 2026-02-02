import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamenService } from '../../services/examen.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { JerarquiaService } from '../../../../core/services/jerarquia.service';
import { ModuloJerarquia, ResultadoAprendizaje } from '../../../../core/models/jerarquia.model';

@Component({
    selector: 'app-examenes-realizados',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './examenes-realizados.component.html',
    styleUrls: ['./examenes-realizados.component.scss']
})
export class ExamenesRealizadosComponent implements OnInit {
    sesiones: any[] = [];
    sesionesFiltradas: any[] = [];
    loading: boolean = true;

    // Filtros
    modulos: ModuloJerarquia[] = [];
    rasDisponibles: ResultadoAprendizaje[] = [];

    filtros = {
        modulo: '',
        ras: [] as string[], // Modificado: array para multi-selección
        fecha: '',
        orden: 'desc' // 'desc' = más reciente, 'asc' = más antiguo
    };

    constructor(
        private examenService: ExamenService,
        private authService: AuthService,
        private notificacionService: NotificacionService,
        private confirmationService: ConfirmationService,
        private jerarquiaService: JerarquiaService
    ) { }

    ngOnInit(): void {
        this.cargarJerarquia();
        this.cargarSesiones();
    }

    cargarJerarquia(): void {
        this.jerarquiaService.getJerarquia().subscribe({
            next: (data) => this.modulos = data,
            error: () => console.error('Error al cargar jerarquía para filtros')
        });
    }

    seleccionarModulo(nombre: string): void {
        this.filtros.modulo = nombre;
        this.onModuloChange();
    }

    seleccionarRA(codigo: string): void {
        if (!codigo) {
            this.filtros.ras = [];
        } else {
            this.toggleRA(codigo);
            return; // toggleRA already calls aplicarFiltros
        }
        this.aplicarFiltros();
    }

    toggleRA(codigo: string): void {
        const index = this.filtros.ras.indexOf(codigo);
        if (index > -1) {
            this.filtros.ras.splice(index, 1);
        } else {
            this.filtros.ras.push(codigo);
        }
        this.aplicarFiltros();
    }

    onModuloChange(): void {
        const modulo = this.modulos.find(m => m.nombre === this.filtros.modulo);
        this.rasDisponibles = modulo ? modulo.ras : [];
        this.filtros.ras = [];
        this.aplicarFiltros();
    }

    cargarSesiones(): void {
        const user = this.authService.getCurrentUser();
        if (!user) return;

        this.loading = true;
        this.examenService.obtenerSesionesConResultados(user.id).subscribe({
            next: (data) => {
                this.sesiones = data;
                this.aplicarFiltros();
                this.loading = false;
            },
            error: (err: any) => {
                this.notificacionService.mostrar('Error al cargar resultados: ' + err.message, 'error');
                this.loading = false;
            }
        });
    }

    aplicarFiltros(): void {
        let temp = [...this.sesiones];

        // 1. Filtro por Módulo
        if (this.filtros.modulo) {
            temp = temp.filter(s => s.examen_id?.asignatura === this.filtros.modulo);
        }

        // 2. Filtro por RA (si hay RAs seleccionados, el examen debe contener al menos uno)
        if (this.filtros.ras.length > 0) {
            temp = temp.filter(s => {
                const examRas = s.examen_id?.ras || [];
                return this.filtros.ras.some(r => examRas.includes(r));
            });
        }

        // 3. Filtro por Fecha
        if (this.filtros.fecha) {
            const fechaFiltro = new Date(this.filtros.fecha).toDateString();
            temp = temp.filter(s => new Date(s.createdAt).toDateString() === fechaFiltro);
        }

        // 4. Ordenación por Fecha
        temp.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return this.filtros.orden === 'desc' ? dateB - dateA : dateA - dateB;
        });

        this.sesionesFiltradas = temp;
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
                this.sesionesFiltradas = this.sesionesFiltradas.filter(s => s._id !== sesionId);
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
