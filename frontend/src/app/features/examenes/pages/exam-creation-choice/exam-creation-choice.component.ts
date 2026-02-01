import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-exam-creation-choice',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './exam-creation-choice.component.html',
    styleUrls: ['./exam-creation-choice.component.scss']
})
export class ExamCreationChoiceComponent {
    constructor(private router: Router) { }

    navigateToManual(): void {
        this.router.navigate(['/examenes/crear']);
    }

    navigateToAI(): void {
        this.router.navigate(['/examenes/crear-ai']);
    }
}
