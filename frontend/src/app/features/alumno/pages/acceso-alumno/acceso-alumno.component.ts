import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamenService } from '../../../../features/examenes/services/examen.service';

@Component({
  selector: 'app-acceso-alumno',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './acceso-alumno.component.html',
  styleUrls: ['./acceso-alumno.component.scss']
})
export class AccesoAlumnoComponent implements OnInit {
  accesoForm: FormGroup;
  generalError: string = '';
  token: string | null = null;
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private examenService: ExamenService
  ) {
    this.accesoForm = this.fb.group({
      studentName: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)*$/)
      ]],
      studentEmail: ['', [Validators.required, Validators.email]]
    });

    this.accesoForm.valueChanges.subscribe(() => {
      if (this.generalError) this.generalError = '';
    });
  }

  ngOnInit(): void {
    // Capturamos el token de la URL automáticamente
    this.route.params.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.generalError = 'Enlace de examen no válido o incompleto.';
      }
    });
  }

  onSubmit() {
    if (this.accesoForm.valid && this.token) {
      const { studentName, studentEmail } = this.accesoForm.value;
      this.cargando = true;

      // Primero verificamos si el alumno ya ha realizado este examen
      this.examenService.verificarIntentoExistente(this.token, studentEmail).subscribe({
        next: (existe) => {
          this.cargando = false;
          if (existe) {
            this.generalError = 'El examen ya fue registrado por esa cuenta de correo.';
          } else {
            // Navegamos a la ruta de realizar examen pasando la identificación
            this.router.navigate(['/alumno/realizar', this.token], {
              state: { studentName, studentEmail }
            });
          }
        },
        error: (err) => {
          this.cargando = false;
          // Mostramos el mensaje exacto que viene del backend (Error normalizado o 403)
          this.generalError = err.error?.message || err.message || 'Error al verificar el acceso';
        }
      });
    } else if (!this.token) {
      this.generalError = 'No se puede acceder al examen sin un token válido.';
    } else {
      this.accesoForm.markAllAsTouched();
      this.generalError = 'Por favor, completa tus datos correctamente.';
    }
  }
}
