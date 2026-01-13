import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-crear-examen',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './crear-examen.component.html',
  styleUrls: ['./crear-examen.component.scss']
})
export class CrearExamenComponent {
  constructor() {}
}