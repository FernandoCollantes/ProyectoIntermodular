import { Component, ViewEncapsulation } from '@angular/core'; // <--- 1. Importamos ViewEncapsulation
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-pregunta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './crear-pregunta.component.html',
  styleUrls: ['./crear-pregunta.component.scss'],
  encapsulation: ViewEncapsulation.None // <--- 2. La llave que deja entrar los estilos globales
})
export class CrearPreguntaComponent {
  
  constructor() {}

  onSubmit() {
    console.log('Formulario enviado');
  }
}