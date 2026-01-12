import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-realizar-examen',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './realizar-examen.component.html',
    styleUrls: ['./realizar-examen.component.scss']
})
export class RealizarExamenComponent implements OnInit {
    // Datos de ejemplo para que la interfaz no esté vacía
    examenTitulo = "Examen Final Matemáticas - 1º Trimestre";
    alumnoNombre = "Fernando Collantes";
    tiempoRestante = "45:23";

    indiceActual = 0;
    preguntasResueltas = 0;

    // Simulación de lo que vendrá del backend
    preguntasPrueba = [
        {
            enunciado: '¿Cuál es la solución de 24+2?',
            opciones: ['3', '26', '5', '28'],
            respuestaSeleccionada: null as number | null
        },
        {
            enunciado: '¿Cuál es el resultado de 5 x 5?',
            opciones: ['10', '20', '25', '30'],
            respuestaSeleccionada: null as number | null
        }
    ];

    ngOnInit(): void {
        // Aquí Andy implementará la carga desde el servicio
    }

    get preguntaActual() {
        return this.preguntasPrueba[this.indiceActual];
    }

    seleccionarOpcion(idx: number): void {
        this.preguntaActual.respuestaSeleccionada = idx;
        this.actualizarProgreso();
    }

    actualizarProgreso(): void {
        this.preguntasResueltas = this.preguntasPrueba.filter(p => p.respuestaSeleccionada !== null).length;
    }

    irAnterior(): void {
        if (this.indiceActual > 0) this.indiceActual--;
    }

    irSiguiente(): void {
        if (this.indiceActual < this.preguntasPrueba.length - 1) this.indiceActual++;
    }

    finalizarExamen(): void {
        console.log('Enviando respuestas:', this.preguntasPrueba);
        alert('Examen finalizado. Revisa la consola para ver las respuestas capturadas.');
    }
}