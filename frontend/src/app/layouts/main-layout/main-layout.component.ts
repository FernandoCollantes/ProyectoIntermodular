import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

// Importamos nuestros nuevos componentes compartidos
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { User } from '../../core/models/user.model';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    // Importante: Añadimos Sidebar y Header aquí
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        SidebarComponent,
        HeaderComponent
    ],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MainLayoutComponent {

    // Exposed to template via async pipe or direct access if preferred
    user$: Observable<User | null>;

    sidebarCollapsed = false;

    constructor(
        private authService: AuthService
    ) {
        this.user$ = this.authService.currentUser$;
    }

    onToggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }

    getPageTitle(): string {
        const path = window.location.pathname;
        if (path.includes('dashboard')) return 'INICIO';
        if (path.includes('crear-pregunta') || path.includes('preguntas/crear')) return 'Crear Nueva Pregunta';
        if (path.includes('preguntas')) return 'Banco de Preguntas';
        if (path.includes('crear-examen') || path.includes('examenes/crear')) return 'Crear Nuevo Examen';
        if (path.includes('examenes')) return 'Mis Exámenes';
        return 'ExamGen Panel';
    }

    onLogout() {
        this.authService.logout();
    }

    // onSwitchCycle removed
}