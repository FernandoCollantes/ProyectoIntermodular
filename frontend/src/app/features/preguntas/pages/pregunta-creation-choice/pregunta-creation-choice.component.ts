import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-pregunta-creation-choice',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pregunta-creation-choice.component.html',
    styleUrls: ['./pregunta-creation-choice.component.scss']
})
export class PreguntaCreationChoiceComponent {
    constructor(private router: Router) { }

    navigateToManual(): void {
        this.router.navigate(['/preguntas/manual']);
    }

    navigateToAI(): void {
        this.router.navigate(['/preguntas/crear-ai']);
    }
}
