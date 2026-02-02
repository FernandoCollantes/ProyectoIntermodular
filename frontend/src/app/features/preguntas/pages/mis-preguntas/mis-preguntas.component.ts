import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Servicios
import { PreguntaService } from '../../services/pregunta.service';
import { JerarquiaService } from '../../../../core/services/jerarquia.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

// Modelos (Importamos el nuevo modelo de Módulo)
import { Pregunta } from '../../../../core/models/pregunta.model';
import { ModuloJerarquia, ResultadoAprendizaje } from '../../../../core/models/jerarquia.model';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-mis-preguntas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-preguntas.component.html',
  styleUrls: ['./mis-preguntas.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MisPreguntasComponent implements OnInit {
  protected readonly Array = Array;
  String = String;
  preguntas: Pregunta[] = [];

  // Ahora guardamos los objetos completos del XML para tener acceso a todo
  listaModulosXML: ModuloJerarquia[] = [];

  cargando: boolean = true;
  filtroModulo: string = '';
  filtrosRA: string[] = [];
  filtroDificultad: string = '';
  terminoBusqueda: string = '';

  rasDisponibles: ResultadoAprendizaje[] = [];

  // Modal states
  modalEliminarVisible: boolean = false;
  idPreguntaAEliminar: string | null = null;

  constructor(
    private preguntaService: PreguntaService,
    private jerarquiaService: JerarquiaService,
    private notiService: NotificacionService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private router: Router
  ) { }

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
    this.filtrosRA = []; // Reset RAs when module changes
    this.filtroDificultad = ''; // Reset Difficulty when module changes

    if (nombreModulo) {
      const modulo = this.listaModulosXML.find(m => m.nombre === nombreModulo);
      this.rasDisponibles = modulo?.ras || [];
    } else {
      this.rasDisponibles = [];
    }

    this.aplicarFiltros();
  }

  seleccionarRA(codigo: string): void {
    if (!codigo) {
      this.filtrosRA = [];
    } else {
      const index = this.filtrosRA.indexOf(codigo);
      if (index > -1) {
        this.filtrosRA.splice(index, 1);
      } else {
        this.filtrosRA.push(codigo);
      }
    }
    this.aplicarFiltros();
  }

  seleccionarDificultad(nivel: string): void {
    if (this.filtroDificultad === nivel) {
      this.filtroDificultad = '';
    } else {
      this.filtroDificultad = nivel;
    }
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.cargando = true;
    this.preguntas = [];

    // Enviamos el nombre del módulo como filtro al backend
    // No enviamos el RA (tema) al backend para permitir multi-filtrado local
    this.preguntaService.buscarPreguntas({
      subject: this.filtroModulo || undefined,
      difficulty: this.filtroDificultad || undefined
    }).subscribe({
      next: (data: Pregunta[]) => {
        console.log('Datos recibidos del backend:', data); // DEBUG

        let filtradas = data;

        // Filtrado por RA (Multi-selección)
        if (this.filtrosRA.length > 0) {
          filtradas = filtradas.filter(p =>
            p.tema && p.tema.some(t => this.filtrosRA.includes(t))
          );
        }

        // 3. Filtrado por módulo (case-insensitive y trimmed)
        if (this.filtroModulo) {
          filtradas = filtradas.filter(p =>
            p.asignatura.toLowerCase().trim() === this.filtroModulo.toLowerCase().trim()
          );
        }

        // Filtrado por texto
        if (this.terminoBusqueda) {
          this.preguntas = filtradas.filter(p =>
            p.enunciado.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
          );
        } else {
          this.preguntas = filtradas;
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.notiService.mostrar('Error al conectar con el servidor', 'error');
      }
    });
  }

  async borrarPregunta(id: string | undefined): Promise<void> {
    if (!id) return;

    const confirmar = await this.confirmationService.confirm({
      title: '¿Eliminar pregunta?',
      message: 'Esta acción eliminará la pregunta de forma permanente y no se podrá deshacer.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmar) return;

    this.preguntaService.eliminarPregunta(id).subscribe({
      next: () => {
        this.notiService.mostrar('Pregunta eliminada con éxito');
        this.aplicarFiltros();
      },
      error: () => {
        this.notiService.mostrar('No se pudo eliminar la pregunta', 'error');
      }
    });
  }

  editarPregunta(id: string | undefined): void {
    console.log('Intentando editar pregunta con ID:', id); // DEBUG
    if (id) {
      this.router.navigate(['/preguntas/editar', id]);
    } else {
      console.error('ID indefinido, no se puede editar');
    }
  }



  getClaseDificultad(dificultad: any): string {
    const nivel = parseInt(dificultad, 10);
    if (nivel === 0) return 'insignia-exito';
    if (nivel === 1) return 'insignia-advertencia';
    if (nivel >= 2) return 'insignia-peligro';

    // Fallback para strings antiguos por si acaso
    const d = String(dificultad || '').toLowerCase();
    if (d.includes('facil') || d.includes('fácil')) return 'insignia-exito';
    if (d.includes('media')) return 'insignia-advertencia';
    if (d.includes('dificil') || d.includes('difícil')) return 'insignia-peligro';
    return 'insignia-neutral';
  }
}