import { Component, OnInit } from '@angular/core';
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
export class AccesoAlumnoComponent implements OnInit {
    accesoForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private router: Router
    ) {
        // Inicializamos el formulario con validaciones certeras
        this.accesoForm = this.fb.group({
            examCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
            studentName: ['', [Validators.required, Validators.minLength(3)]],
            studentEmail: ['', [Validators.required, Validators.email]]
        });
    }

    ngOnInit(): void {
        // Listo para implementar lógica de carga si fuera necesario
    }

    onSubmit(): void {
        if (this.accesoForm.invalid) {
            this.accesoForm.markAllAsTouched();
            return;
        }

        // TODO: Andy implementará aquí la llamada al servicio de validación de código
        console.log('Datos de acceso:', this.accesoForm.value);

        // Navegación programática hacia el examen
        this.router.navigate(['/alumno/realizar-examen']);
    }
}