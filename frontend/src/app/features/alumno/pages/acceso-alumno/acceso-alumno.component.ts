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
      examCode: ['', [Validators.required, Validators.minLength(4)]],
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
      // TODO: Implement actual service call here
      console.log('Acceso data:', this.accesoForm.value);
      this.router.navigate(['/alumno/realizar-examen']);
    } else {
      this.accesoForm.markAllAsTouched();
      this.generalError = 'Por favor, completa todos los campos correctamente para continuar.';
    }
  }
}