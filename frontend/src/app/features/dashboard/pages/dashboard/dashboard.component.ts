import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

// Interfaz sencilla para las estadísticas
interface Estadiastica {
    label: string;
    value: number;
    icon?: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, MatIconModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    // Estos datos ahora se renderizan dinámicamente
    stats: Estadiastica[] = [
        { label: 'Total Preguntas', value: 124 },
        { label: 'Exámenes Creados', value: 18 },
        { label: 'Alumnos Participantes', value: 342 },
        { label: 'Asignaturas', value: 5 }
    ];

    // Placeholder para actividad reciente
    actividades: any[] = [];

    constructor() { }

    ngOnInit(): void {
        // Aquí es donde llamaríamos a un servicio de estadísticas en el futuro
        this.cargarActividadReciente();
    }

    cargarActividadReciente(): void {
        // Por ahora lo dejamos vacío como en tu prototipo
        this.actividades = [];
    }
}