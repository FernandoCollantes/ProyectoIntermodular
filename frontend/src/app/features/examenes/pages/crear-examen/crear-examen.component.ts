import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services & Models
import { AsignaturaService } from '@core/services/asignatura.service';
import { ExamenService } from '@features/examenes/services/examen.service';
import { Pregunta } from '@core/models';

@Component({
  selector: 'app-crear-examen',
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
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './crear-examen.component.html',
  styleUrls: ['./crear-examen.component.scss']
})
export class CrearExamenComponent implements OnInit {
  examForm: FormGroup;
  asignaturas: string[] = [];
  generatedQuestions: Pregunta[] = [];
  isLoading = false;
  isGenerating = false;

  constructor(
    private fb: FormBuilder,
    private asignaturaService: AsignaturaService,
    private examenService: ExamenService,
    private snackBar: MatSnackBar
  ) {
    this.examForm = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      numQuestions: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
      duration: [60, Validators.required],
      passingGrade: [50, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.asignaturaService.getAsignaturas().subscribe({
      next: (subs) => this.asignaturas = subs,
      error: () => this.mostrarMensaje('Error al cargar asignaturas')
    });
  }

  // Genera la vista previa de preguntas desde el servidor
  generatePreview(): void {
    if (this.examForm.invalid) {
      this.mostrarMensaje('Por favor, completa la configuración del examen.');
      return;
    }

    this.isGenerating = true;
    const { subject, numQuestions } = this.examForm.value;

    this.examenService.generarPreview({ subject, amount: numQuestions }).subscribe({
      next: (examen) => {
        // Asumiendo que el backend devuelve un objeto con un array de preguntas
        this.generatedQuestions = examen.preguntas || [];
        this.isGenerating = false;
        this.mostrarMensaje(`Se han generado ${this.generatedQuestions.length} preguntas.`);
      },
      error: () => {
        this.isGenerating = false;
        this.mostrarMensaje('No hay suficientes preguntas para esta asignatura.');
      }
    });
  }

  onSubmit(): void {
    if (this.generatedQuestions.length === 0) {
      this.mostrarMensaje('Primero genera la vista previa de las preguntas.');
      return;
    }
    this.downloadPdf();
  }

  downloadPdf(): void {
    this.isLoading = true;
    const examenPayload = {
      nombre: this.examForm.get('title')?.value,
      preguntas: this.generatedQuestions,
      fecha_creacion: new Date(),
      config: this.examForm.value
    };

    this.examenService.descargarPdf(examenPayload).subscribe({
      next: (blob) => {
        this.examenService.guardarArchivo(blob, `${examenPayload.nombre}.pdf`);
        this.isLoading = false;
        this.mostrarMensaje('Examen generado y descargado.');
      },
      error: () => {
        this.isLoading = false;
        this.mostrarMensaje('Error al procesar el PDF.');
      }
    });
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
  }
}