import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JerarquiaService } from '@core/services/jerarquia.service';
import { CursoJerarquia, AsignaturaJerarquia } from '@core/models/jerarquia.model';

@Component({
  selector: 'app-asignaturas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asignaturas.component.html',
  styleUrls: ['./asignaturas.component.scss']
})
export class AsignaturasComponent implements OnInit {
  modulos: AsignaturaJerarquia[] = [];
  cargando: boolean = true;
  moduloAbiertoId: string | null = null;

  constructor(private jerarquiaService: JerarquiaService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.jerarquiaService.getCursos().subscribe({
      next: (cursos: CursoJerarquia[]) => {
        // Unificamos los módulos de DAW y DAM (1er curso compartido)
        const mapaModulos = new Map<string, AsignaturaJerarquia>();
        
        cursos.forEach(curso => {
          curso.asignaturas.forEach(asig => {
            if (!mapaModulos.has(asig._id)) {
              mapaModulos.set(asig._id, asig);
            }
          });
        });
        
        this.modulos = Array.from(mapaModulos.values());
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando módulos:', err);
        this.cargando = false;
      }
    });
  }

  toggleModulo(id: string): void {
    this.moduloAbiertoId = this.moduloAbiertoId === id ? null : id;
  }
}