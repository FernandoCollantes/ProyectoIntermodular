import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-acceso-alumno',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './acceso-alumno.component.html',
  styleUrls: ['./acceso-alumno.component.scss']
})
export class AccesoAlumnoComponent {}