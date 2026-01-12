import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services & Models (Asegúrate de que estas rutas sean correctas en tu proyecto)
import { AsignaturaService } from '@core/services/asignatura.service';
import { PreguntaService } from '@features/preguntas/services/pregunta.service';
import { CrearPreguntaDto, Pregunta } from '@core/models';

@Component({
    selector: 'app-crear-pregunta',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './crear-pregunta.component.html',
    styleUrls: ['./crear-pregunta.component.scss']
})
export class CrearPreguntaComponent implements OnInit {
    questionForm: FormGroup;
    asignaturas: string[] = [];
    temas: string[] = [];
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private preguntaService: PreguntaService,
        private asignaturaService: AsignaturaService,
        private snackBar: MatSnackBar
    ) {
        this.questionForm = this.fb.group({
            asignatura: ['', Validators.required],
            tema: ['', Validators.required],
            dificultad: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
            enunciado: ['', [Validators.required, Validators.minLength(10)]],
            respuesta_correcta: ['', Validators.required],
            incorrect_options: this.fb.array([], [Validators.required])
        });
    }

    ngOnInit(): void {
        this.loadAsignaturas();
        // Inicializamos con 3 opciones incorrectas por defecto
        for (let i = 0; i < 3; i++) { this.addIncorrectOption(); }

        // Escuchar cambios en asignatura para cargar temas
        this.questionForm.get('asignatura')?.valueChanges.subscribe(subject => {
            if (subject) this.loadTemas(subject);
            else this.temas = [];
        });
    }

    get incorrectOptions(): FormArray {
        return this.questionForm.get('incorrect_options') as FormArray;
    }

    addIncorrectOption(): void {
        this.incorrectOptions.push(this.fb.control('', Validators.required));
    }

    removeIncorrectOption(index: number): void {
        if (this.incorrectOptions.length > 1) this.incorrectOptions.removeAt(index);
    }

    loadAsignaturas(): void {
        this.asignaturaService.getAsignaturas().subscribe(data => this.asignaturas = data);
    }

    loadTemas(subject: string): void {
        this.asignaturaService.getTemas(subject).subscribe(data => this.temas = data);
    }

    onSubmit(): void {
        if (this.questionForm.invalid) return;

        this.isLoading = true;
        const rawValue = this.questionForm.value;

        // MAPEO DE DATOS: Convertimos el formulario al DTO que espera el servicio
        const payload: CrearPreguntaDto = {
            enunciado: rawValue.enunciado,
            asignatura: rawValue.asignatura,
            tema: rawValue.tema,
            dificultad: Number(rawValue.dificultad),
            respuesta_correcta: rawValue.respuesta_correcta,
            // Combinamos la correcta con las incorrectas en un solo array para MongoDB
            opciones: [rawValue.respuesta_correcta, ...rawValue.incorrect_options]
        };

        this.preguntaService.crearPregunta(payload).subscribe({
            next: () => {
                this.isLoading = false;
                this.snackBar.open('Pregunta guardada con éxito', 'OK', { duration: 3000 });
                this.resetForm();
            },
            error: () => {
                this.isLoading = false;
                this.snackBar.open('Error al guardar la pregunta', 'Cerrar', { duration: 3000 });
            }
        });
    }

    resetForm(): void {
        this.questionForm.reset({ dificultad: 5 });
        while (this.incorrectOptions.length) { this.incorrectOptions.removeAt(0); }
        for (let i = 0; i < 3; i++) { this.addIncorrectOption(); }
    }
}