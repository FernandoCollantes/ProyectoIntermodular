import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Services
import { ExamenService } from '../../../examenes/services/examen.service';
import { PreguntaService } from '../../../preguntas/services/pregunta.service';
import { AuthService } from '../../../../core/services/auth.service';

// Models
import { Examen } from '../../../../core/models/examen.model';
import { Pregunta } from '../../../../core/models/pregunta.model';

interface ActividadReciente {
  tipo: 'examen' | 'pregunta';
  titulo: string;
  fecha: Date;
  id?: string;
  esUltimo?: boolean; // Flag to highlight the most recent item
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  actividadReciente: ActividadReciente[] = [];
  cargando: boolean = true;

  constructor(
    private examenService: ExamenService,
    private preguntaService: PreguntaService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarActividadReciente();
  }

  cargarActividadReciente(): void {
    this.cargando = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.cargando = false;
      return;
    }

    // Load both exams and questions in parallel
    Promise.all([
      this.examenService.obtenerExamenes(currentUser.id).toPromise(),
      this.examenService.obtenerBorradores(currentUser.id).toPromise(),
      this.preguntaService.buscarPreguntas({ creatorId: currentUser.id }).toPromise()
    ]).then(([examenesPublicados, borradores, preguntas]) => {
      const actividades: ActividadReciente[] = [];

      // Combine published and draft exams
      const todosExamenes = [...(examenesPublicados || []), ...(borradores || [])];

      // Add exams to activity
      todosExamenes.forEach(examen => {
        actividades.push({
          tipo: 'examen',
          titulo: examen.titulo,
          fecha: examen.createdAt || new Date(),
          id: examen._id
        });
      });

      // Add questions to activity
      (preguntas || []).forEach(pregunta => {
        actividades.push({
          tipo: 'pregunta',
          titulo: pregunta.enunciado,
          fecha: (pregunta as any).createdAt || (pregunta as any).fecha_creacion || new Date(),
          id: pregunta._id
        });
      });

      // Sort by date (most recent first)
      actividades.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      // Get only the most recent exam and most recent question
      const ultimoExamen = actividades.find(a => a.tipo === 'examen');
      const ultimaPregunta = actividades.find(a => a.tipo === 'pregunta');

      // Create array with only these two items
      const actividadesFinales: ActividadReciente[] = [];

      if (ultimoExamen) {
        ultimoExamen.esUltimo = true;
        actividadesFinales.push(ultimoExamen);
      }

      if (ultimaPregunta) {
        ultimaPregunta.esUltimo = true;
        actividadesFinales.push(ultimaPregunta);
      }

      // Sort again to show most recent first
      actividadesFinales.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      this.actividadReciente = actividadesFinales;
      this.cargando = false;
    }).catch(error => {
      console.error('Error loading recent activity:', error);
      this.cargando = false;
    });
  }

  formatearFecha(fecha: Date): string {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  getTipoTexto(tipo: 'examen' | 'pregunta'): string {
    return tipo === 'examen' ? 'Examen' : 'Pregunta';
  }
}