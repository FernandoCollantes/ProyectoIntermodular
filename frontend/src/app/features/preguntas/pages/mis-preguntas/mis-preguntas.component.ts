import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Servicios
import { PreguntaService } from '../../services/pregunta.service';
import { JerarquiaService } from '../../../../core/services/jerarquia.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';

// Modelos (Importamos el nuevo modelo de Módulo)
import { Pregunta } from '../../../../core/models/pregunta.model';
import { ModuloJerarquia } from '../../../../core/models/jerarquia.model';

@Component({
  selector: 'app-mis-preguntas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-preguntas.component.html',
  styleUrls: ['./mis-preguntas.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MisPreguntasComponent implements OnInit {
  String = String; 
  preguntas: Pregunta[] = [];
  
  // Ahora guardamos los objetos completos del XML para tener acceso a todo
  listaModulosXML: ModuloJerarquia[] = []; 
  
  cargando: boolean = true;
  filtroModulo: string = '';
  terminoBusqueda: string = '';

  constructor(
    private preguntaService: PreguntaService,
    private jerarquiaService: JerarquiaService,
    private notiService: NotificacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales(): void {
    this.cargando = true;
    
    // 1. Cargamos la jerarquía desde el DAMyDAW.xml
    this.jerarquiaService.getJerarquia().subscribe({
      next: (modulos) => {
        this.listaModulosXML = modulos;
      },
      error: () => this.notiService.mostrar('Error al leer el archivo XML', 'error')
    });

    // 2. Cargamos las preguntas del servidor de Andy
    this.aplicarFiltros();
  }

  seleccionarModulo(nombreModulo: string): void {
    this.filtroModulo = nombreModulo;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.cargando = true;
    this.preguntas = []; 

    // Enviamos el nombre del módulo como filtro al backend
    this.preguntaService.buscarPreguntas({ subject: this.filtroModulo || undefined }).subscribe({
      next: (data: Pregunta[]) => {
        if (this.terminoBusqueda) {
          this.preguntas = data.filter(p => 
            p.enunciado.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
          );
        } else {
          this.preguntas = data;
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.notiService.mostrar('Error al conectar con el servidor', 'error');
      }
    });
  }

  borrarPregunta(id: string | undefined): void {
    if (!id || !confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) return;
    
    this.preguntaService.eliminarPregunta(id).subscribe({
      next: () => {
        this.notiService.mostrar('Pregunta eliminada con éxito');
        this.aplicarFiltros();
      },
      error: () => this.notiService.mostrar('No se pudo eliminar la pregunta', 'error')
    });
  }

  editarPregunta(id: string | undefined): void {
    if (id) this.router.navigate(['/preguntas/editar', id]);
  }

  getClaseDificultad(dificultad: any): string {
    const d = String(dificultad || '').toLowerCase();
    if (d.includes('facil') || d.includes('fácil')) return 'insignia-exito';
    if (d.includes('media')) return 'insignia-advertencia';
    if (d.includes('dificil') || d.includes('difícil')) return 'insignia-peligro';
    return 'insignia-neutral';
  }
}