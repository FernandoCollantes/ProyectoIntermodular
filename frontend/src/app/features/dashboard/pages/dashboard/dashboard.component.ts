import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Services
import { ExamenService } from '../../../examenes/services/examen.service';
import { PreguntaService } from '../../../preguntas/services/pregunta.service';
import { AuthService } from '../../../../core/services/auth.service';
import { JerarquiaService } from '../../../../core/services/jerarquia.service';

// Models
import { Examen } from '../../../../core/models/examen.model';
import { Pregunta } from '../../../../core/models/pregunta.model';

interface ActividadReciente {
  tipo: 'examen' | 'pregunta' | 'realizado';
  titulo: string;
  fecha: Date;
  id?: string;
  esUltimo?: boolean;
  dificultad?: number;
  modulo?: string;
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
  totalPreguntas: number = 0;
  totalExamenes: number = 0;
  totalAsignaturas: number = 0;

  constructor(
    private examenService: ExamenService,
    private preguntaService: PreguntaService,
    private authService: AuthService,
    private jerarquiaService: JerarquiaService
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

    // Load exams, drafts, questions, and shared sessions (results) in parallel
    Promise.all([
      this.examenService.obtenerExamenes(currentUser.id).toPromise(),
      this.examenService.obtenerBorradores(currentUser.id).toPromise(),
      this.preguntaService.buscarPreguntas({ creatorId: currentUser.id }).toPromise(),
      this.examenService.obtenerSesionesConResultados(currentUser.id).toPromise(),
      this.jerarquiaService.getJerarquia().toPromise()
    ]).then(([examenesPublicados, borradores, preguntas, sesiones, modulos]) => {
      this.totalPreguntas = preguntas?.length || 0;
      this.totalExamenes = (examenesPublicados?.length || 0) + (borradores?.length || 0);
      this.totalAsignaturas = modulos?.length || 0;



      const actividades: ActividadReciente[] = [];

      // 1. Process Created Exams (Published + Drafts)
      const todosExamenes = [...(examenesPublicados || []), ...(borradores || [])];
      todosExamenes.forEach(examen => {
        actividades.push({
          tipo: 'examen',
          titulo: examen.titulo,
          fecha: examen.createdAt ? new Date(examen.createdAt) : new Date(),
          id: examen._id,
          modulo: examen.asignatura
        });
      });

      // 2. Process Created Questions
      (preguntas || []).forEach(pregunta => {
        actividades.push({
          tipo: 'pregunta',
          titulo: pregunta.enunciado,
          fecha: (pregunta as any).createdAt ? new Date((pregunta as any).createdAt) :
            ((pregunta as any).fecha_creacion ? new Date((pregunta as any).fecha_creacion) : new Date()),
          id: pregunta._id,
          dificultad: pregunta.dificultad
        });
      });

      // 3. Process Completed Exams (Results from Shared Sessions)
      const todosResultados: any[] = [];
      (sesiones || []).forEach(sesion => {
        (sesion.intentos || []).forEach((intento: any) => {
          todosResultados.push({
            ...intento,
            tituloExamen: sesion.examen_id?.titulo || 'Examen sin título',
            modulo: sesion.examen_id?.asignatura,
            idExamen: sesion.examen_id?._id
          });
        });
      });

      todosResultados.forEach(resultado => {
        actividades.push({
          tipo: 'realizado',
          titulo: resultado.tituloExamen,
          fecha: resultado.fecha_intento ? new Date(resultado.fecha_intento) : new Date(),
          id: resultado.idExamen,
          modulo: resultado.modulo
        });
      });

      // Sort all by date to find the absolute "most recent" of each category
      actividades.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

      const ultimoExamen = actividades.find(a => a.tipo === 'examen');
      const ultimaPregunta = actividades.find(a => a.tipo === 'pregunta');
      const ultimoRealizado = actividades.find(a => a.tipo === 'realizado');

      // Create array with the top 3 items
      const actividadesFinales: ActividadReciente[] = [];
      if (ultimoExamen) actividadesFinales.push(ultimoExamen);
      if (ultimaPregunta) actividadesFinales.push(ultimaPregunta);
      if (ultimoRealizado) actividadesFinales.push(ultimoRealizado);

      // Identify the absolute most recent among the three
      if (actividadesFinales.length > 0) {
        actividadesFinales.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        actividadesFinales[0].esUltimo = true;
      }

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

  getTipoTexto(tipo: 'examen' | 'pregunta' | 'realizado'): string {
    if (tipo === 'examen') return 'Examen Creado';
    if (tipo === 'pregunta') return 'Pregunta Creada';
    if (tipo === 'realizado') return 'Examen Realizado';
    return '';
  }

  getDificultadTexto(nivel: number | undefined): string {
    if (nivel === undefined) return 'N/A';
    const niveles: Record<number, string> = {
      0: 'Fácil',
      1: 'Media',
      2: 'Difícil'
    };
    return niveles[nivel] || 'N/A';
  }
}