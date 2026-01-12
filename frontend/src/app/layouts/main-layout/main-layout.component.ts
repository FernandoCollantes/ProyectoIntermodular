import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterOutlet, MatIconModule],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
    userName = 'Fernando Collantes';
    userInitials = 'FC';

    getPageTitle(): string {
        const path = window.location.pathname;
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('crear-pregunta') || path.includes('preguntas/crear')) return 'Crear Nueva Pregunta';
        if (path.includes('preguntas')) return 'Mis Preguntas';
        if (path.includes('crear-examen') || path.includes('examenes/crear')) return 'Crear Nuevo Examen';
        if (path.includes('examenes')) return 'Mis Exámenes';
        return 'ExamGen';
    }
}
