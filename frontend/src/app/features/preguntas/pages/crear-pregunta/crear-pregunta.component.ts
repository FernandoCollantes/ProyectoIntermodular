import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Servicios
import { PreguntaService } from '../../services/pregunta.service';
import { JerarquiaService } from '@core/services/jerarquia.service';
import { NotificacionService } from '@core/services/notificacion.service';

// Modelos
import { CrearPreguntaDto } from '@core/models/pregunta.model';
import { 
  CursoJerarquia, 
  AsignaturaJerarquia, 
  ResultadoAprendizaje, 
  Criterio 
} from '@core/models/jerarquia.model';

@Component({
  selector: 'app-crear-pregunta',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './crear-pregunta.component.html',
  styleUrls: ['./crear-pregunta.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CrearPreguntaComponent implements OnInit {
  preguntaForm: FormGroup;

  // Listas para la cascada del XML
  cursos: CursoJerarquia[] = [];
  asignaturasDisponibles: AsignaturaJerarquia[] = [];
  rasDisponibles: ResultadoAprendizaje[] = [];
  criteriosDisponibles: Criterio[] = [];

  constructor(
    private fb: FormBuilder,
    private preguntaService: PreguntaService,
    private jerarquiaService: JerarquiaService,
    private notiService: NotificacionService,
    private router: Router
  ) {
    this.preguntaForm = this.fb.group({
      // Ubicación Académica
      titulo: ['', Validators.required],
      asignatura: ['', Validators.required],
      ra: ['', Validators.required],
      criterios: [[], Validators.required],

      // Contenido de la pregunta
      enunciado: ['', Validators.required],
      opcionA: ['', Validators.required],
      opcionB: ['', Validators.required],
      opcionC: ['', Validators.required],
      opcionD: ['', Validators.required],
      respuestaCorrecta: ['a', Validators.required],
      dificultad: ['media', Validators.required]
    });
  }

  ngOnInit(): void {
    // Carga inicial de la jerarquía (Mock/XML)
    this.jerarquiaService.getCursos().subscribe(data => {
      this.cursos = data;
    });

    this.escucharCambiosJerarquia();
  }

  private escucharCambiosJerarquia(): void {
    // Escucha cambios en Título -> Carga Asignaturas
    this.preguntaForm.get('titulo')?.valueChanges.subscribe(tituloId => {
      const curso = this.cursos.find(c => c._id === tituloId);
      this.asignaturasDisponibles = curso ? curso.asignaturas : [];
      this.resetCampos(['asignatura', 'ra', 'criterios']);
    });

    // Escucha cambios en Asignatura -> Carga RAs
    this.preguntaForm.get('asignatura')?.valueChanges.subscribe(asigId => {
      const asig = this.asignaturasDisponibles.find(a => a._id === asigId);
      this.rasDisponibles = asig?.resultados_aprendizaje || [];
      this.resetCampos(['ra', 'criterios']);
    });

    // Escucha cambios en RA -> Carga Criterios
    this.preguntaForm.get('ra')?.valueChanges.subscribe(raCod => {
      const ra = this.rasDisponibles.find(r => r.codigo === raCod);
      this.criteriosDisponibles = ra ? ra.criterios : [];
      this.preguntaForm.get('criterios')?.setValue([]);
    });
  }

  private resetCampos(campos: string[]): void {
    campos.forEach(campo => {
      const control = this.preguntaForm.get(campo);
      control?.setValue(campo === 'criterios' ? [] : '', { emitEvent: false });
    });
  }

  onSubmit(): void {
    if (this.preguntaForm.valid) {
      const f = this.preguntaForm.value;
      const raSeleccionado = this.rasDisponibles.find(r => r.codigo === f.ra);

      const dto: CrearPreguntaDto = {
        enunciado: f.enunciado,
        asignatura: f.asignatura, // ID de MongoDB/XML (ej: "0179")
        tema: raSeleccionado ? `RA${raSeleccionado.codigo}: ${raSeleccionado.nombre}` : f.ra,
        dificultad: this.mapearDificultad(f.dificultad),
        respuesta_correcta: this.obtenerTextoCorrecto(f),
        opciones: [f.opcionA, f.opcionB, f.opcionC, f.opcionD],
        criterios: f.criterios
      };

      this.preguntaService.crearPregunta(dto).subscribe({
        next: (resp) => {
          this.notiService.mostrar('¡Pregunta guardada correctamente!');
          this.router.navigate(['/preguntas/mis-preguntas']);
        },
        error: (err) => {
          this.notiService.mostrar('Error al guardar la pregunta', 'error');
          console.error('Error en el backend de Andy:', err);
        }
      });
    } else {
      this.notiService.mostrar('Por favor, rellena todos los campos obligatorios', 'error');
    }
  }

  private mapearDificultad(nivel: string): number {
    const mapa: any = { facil: 3, media: 5, dificil: 8 };
    return mapa[nivel] || 5;
  }

  private obtenerTextoCorrecto(f: any): string {
    const opciones: any = { a: f.opcionA, b: f.opcionB, c: f.opcionC, d: f.opcionD };
    return opciones[f.respuestaCorrecta];
  }
}