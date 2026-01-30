import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-acceso-alumno',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './acceso-alumno.component.html',
  styleUrls: ['./acceso-alumno.component.scss']
})
export class AccesoAlumnoComponent {
  accesoForm: FormGroup;
  generalError: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.accesoForm = this.fb.group({
      examUrl: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.*\/alumno\/e\/[a-zA-Z0-9_-]+$/)
      ]],
      studentName: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/)
      ]],
      studentEmail: ['', [Validators.required, Validators.email]]
    });

    // Limpiar error general cuando el usuario modifica el formulario
    this.accesoForm.valueChanges.subscribe(() => {
      if (this.generalError) {
        this.generalError = '';
      }
    });
  }

  onSubmit() {
    if (this.accesoForm.valid) {
      const { examUrl, studentName } = this.accesoForm.value;

      // Extract ID from URL (last segment)
      // URL format: .../alumno/e/[ID]
      const urlParts = examUrl.split('/');
      const examId = urlParts[urlParts.length - 1];

      if (examId) {
        this.router.navigate(['/alumno/realizar-examen'], {
          queryParams: { id: examId },
          state: { studentName: studentName }
        });
      } else {
        this.generalError = 'No se pudo obtener el ID del examen de la URL proporcionada.';
      }
    } else {
      this.accesoForm.markAllAsTouched();
      this.generalError = 'Por favor, completa todos los campos correctamente para continuar.';
    }
  }
}