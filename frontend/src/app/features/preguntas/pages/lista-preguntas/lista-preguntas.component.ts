import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // For [routerLink]
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { PreguntaService } from '@features/preguntas/services/pregunta.service';
import { AsignaturaService } from '@core/services/asignatura.service';
import { Pregunta } from '@core/models';

@Component({
    selector: 'app-lista-preguntas',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatSnackBarModule
    ],
    templateUrl: './lista-preguntas.component.html',
    styleUrls: ['./lista-preguntas.component.scss']
})
export class ListaPreguntasComponent implements OnInit {
    questions: Pregunta[] = [];
    subjects: string[] = [];

    // Filters
    filterSubject: string = '';
    filterDifficulty: string = '';
    filterTheme: string = '';
    searchText: string = ''; // Not implemented in backend yet appropriately, but used for UI

    isLoading = false;

    constructor(
        private preguntaService: PreguntaService,
        private asignaturaService: AsignaturaService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadSubjects();
        this.search(); // Initial load
    }

    loadSubjects(): void {
        this.asignaturaService.getAsignaturas().subscribe(subs => this.subjects = subs);
    }

    search(): void {
        this.isLoading = true;
        this.preguntaService.buscarPreguntas({
            subject: this.filterSubject,
            difficulty: this.filterDifficulty,
            theme: this.filterTheme
        }).subscribe({
            next: (data) => {
                this.questions = data;
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                this.snackBar.open('Error al cargar preguntas', 'Cerrar', { duration: 3000 });
            }
        });
    }

    // Helper to get formatted date (mocked as it's not in model yet, or use ID timestamp if Mongo)
    getCreationDate(id: string): string {
        // Basic mock: extract timestamp from ObjectId if possible, or just return 'N/A'
        return '15 Nov 2025';
    }

    deleteQuestion(id: string): void {
        if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
            // Not implemented in service yet
            this.snackBar.open('Funcionalidad de eliminar no implementada', 'OK', { duration: 2000 });
        }
    }
}
