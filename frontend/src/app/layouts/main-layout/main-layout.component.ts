import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // RouterOutlet no hace falta si usamos ng-content
import { MatIconModule } from '@angular/material/icon';

// Importamos nuestros nuevos componentes compartidos
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { filter } from 'rxjs/operators';
@Component({
    selector: 'app-main-layout',
    standalone: true,
    // Importante: Añadimos Sidebar y Header aquí
    // AQUÍ ESTÁ LA CLAVE: Hay que declarar qué usa este HTML
    imports: [
        CommonModule, 
        RouterModule, 
        MatIconModule, 
        SidebarComponent, 
        HeaderComponent
    ],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss'],
    // MANTENEMOS ESTO: Vital para que tus estilos globales (styles.scss) entren aquí
    encapsulation: ViewEncapsulation.None 
})
export class MainLayoutComponent {
    userName = 'Fernando Collantes';
    userInitials = 'FC';
    currentUrl: string = '';
    // Tu lógica original para el título se queda, ¡es perfecta!

    getPageTitle(): string {
        const path = window.location.pathname;
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('crear-pregunta') || path.includes('preguntas/crear')) return 'Crear Nueva Pregunta';
        if (path.includes('preguntas')) return 'Banco de Preguntas'; // Pequeño ajuste de nombre
        if (path.includes('crear-examen') || path.includes('examenes/crear')) return 'Crear Nuevo Examen';
        if (path.includes('examenes')) return 'Mis Exámenes';
        return 'ExamGen Panel';
    }
}