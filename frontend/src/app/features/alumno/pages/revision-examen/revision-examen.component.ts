import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ExamenService } from '../../../../features/examenes/services/examen.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';

@Component({
    selector: 'app-revision-examen',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './revision-examen.component.html',
    styleUrls: ['./revision-examen.component.scss']
})
export class RevisionExamenComponent implements OnInit {
    intento: any = null;
    loading: boolean = true;
    letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F'];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private examenService: ExamenService,
        private notificacionService: NotificacionService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.cargarRevision(id);
            } else {
                this.notificacionService.mostrar('ID de intento no válido', 'error');
                this.router.navigate(['/alumno/acceso']);
            }
        });
    }

    cargarRevision(id: string): void {
        this.loading = true;
        this.examenService.obtenerDetallesIntento(id).subscribe({
            next: (data: any) => {
                this.intento = data;
                this.loading = false;
            },
            error: (err: any) => {
                this.notificacionService.mostrar('Error al cargar la revisión: ' + err.message, 'error');
                this.router.navigate(['/alumno/acceso']);
                this.loading = false;
            }
        });
    }

    getClaseOpcion(preg: any, index: number): string {
        if (index === preg.respuesta_correcta) return 'correcta';
        if (index === preg.respuesta_marcada && !preg.es_correcta) return 'incorrecta';
        return '';
    }
}
