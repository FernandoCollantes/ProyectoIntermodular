import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { PreguntaService } from '../../services/pregunta.service';
import { CrearPreguntaDto } from '@core/models';

@Component({
  selector: 'app-crear-pregunta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './crear-pregunta.component.html',
  styleUrls: ['./crear-pregunta.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearPreguntaComponent {
  preguntaForm: FormGroup;
  criteriosDisponibles: string[] = [];
  asignaturas = ['DAM', 'DAW'];

  constructor(
    private fb: FormBuilder,
    private preguntaService: PreguntaService,
    private router: Router
  ) {


    // NOTA: Para respetar el HTML existente (que usa inputs manuales para opciones A,B,C,D), 
    // tendremos que adaptar el FormGroup para que coincida con esos controles o usar ngModel si fuera Template-Driven.
    // Dado que el usuario pidió TODOS obligatorios y "preparar el formulario", es mejor usar ReactiveForms completo.

    this.preguntaForm = this.fb.group({
      asignatura: ['', Validators.required],
      criterios: [[], Validators.required],
      enunciado: ['', Validators.required],
      opcionA: ['', Validators.required],
      opcionB: ['', Validators.required],
      opcionC: ['', Validators.required],
      opcionD: ['', Validators.required],
      respuestaCorrecta: ['a', Validators.required], // Por defecto 'a' o vacío
      dificultad: ['media', Validators.required]
    }, { validators: this.uniqueOptionsValidator });

    // Escuchar cambios en la asignatura
    this.preguntaForm.get('asignatura')?.valueChanges.subscribe(asignatura => {
      this.cargarCriterios(asignatura);
    });
  }

  uniqueOptionsValidator(group: AbstractControl): ValidationErrors | null {
    const values = [
      group.get('opcionA')?.value,
      group.get('opcionB')?.value,
      group.get('opcionC')?.value,
      group.get('opcionD')?.value,
    ].filter(val => val && val.trim() !== '');

    const uniqueValues = new Set(values);

    if (uniqueValues.size !== values.length) {
      return { duplicateOptions: true };
    }
    return null;
  }

  cargarCriterios(asignatura: string) {
    this.preguntaService.getCriterios(asignatura).subscribe(criterios => {
      this.criteriosDisponibles = criterios;
      // Resetear criterios al cambiar asignatura
      this.preguntaForm.patchValue({ criterios: [] });
    });
  }

  onSubmit() {
    if (this.preguntaForm.valid) {
      const val = this.preguntaForm.value;

      // Mapear al DTO esperado por el backend
      const dto: CrearPreguntaDto = {
        asignatura: val.asignatura,
        criterios: val.criterios,
        enunciado: val.enunciado,
        tema: 'General', // No vi campo TEMA en el HTML revertido, asumo valor por defecto o tendré que añadirlo si era obligatorio
        dificultad: this.mapDificultad(val.dificultad),
        opciones: [val.opcionA, val.opcionB, val.opcionC, val.opcionD],
        respuesta_correcta: val.opciones[this.getIndexRespuesta(val.respuestaCorrecta)] // Backend espera el string de la respuesta correcta? o el índice? Modelo dice string.
      };

      // Ajuste: El modelo dice respuesta_correcta: string. Si es el texto de la opción:
      let respuestaTexto = '';
      if (val.respuestaCorrecta === 'a') respuestaTexto = val.opcionA;
      else if (val.respuestaCorrecta === 'b') respuestaTexto = val.opcionB;
      else if (val.respuestaCorrecta === 'c') respuestaTexto = val.opcionC;
      else if (val.respuestaCorrecta === 'd') respuestaTexto = val.opcionD;

      dto.respuesta_correcta = respuestaTexto;

      console.log('Enviando:', dto);
      this.preguntaService.crearPregunta(dto).subscribe({
        next: () => this.router.navigate(['/preguntas']),
        error: (e) => console.error(e)
      });
    } else {
      this.preguntaForm.markAllAsTouched();
    }
  }

  mapDificultad(dif: string): number {
    if (dif === 'facil') return 3;
    if (dif === 'media') return 5;
    if (dif === 'dificil') return 8;
    return 5;
  }

  getIndexRespuesta(letra: string): number {
    return ['a', 'b', 'c', 'd'].indexOf(letra);
  }
}