import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JerarquiaService } from '../../../../core/services/jerarquia.service';
// Importamos el nuevo modelo que sí existe
import { ModuloJerarquia } from '../../../../core/models/jerarquia.model';

@Component({
  selector: 'app-asignaturas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asignaturas.component.html',
  styleUrls: ['./asignaturas.component.scss']
})
export class AsignaturasComponent implements OnInit {
  // Cambiamos la lista de cursos antiguos por la lista de módulos del XML
  modulos: ModuloJerarquia[] = [];
  cargando: boolean = true;
  activeModuleIndex: number | null = null;

  constructor(private jerarquiaService: JerarquiaService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    // Usamos el nuevo método del servicio que lee el XML DAMyDAW.xml
    this.jerarquiaService.getJerarquia().subscribe({
      next: (data: ModuloJerarquia[]) => {
        this.modulos = data;
        this.cargando = false;
      },
      error: (err: any) => { // Añadimos el tipo :any para evitar el error TS7006
        console.error('Error al cargar módulos:', err);
        this.cargando = false;
      }
    });
  }

  toggle(index: number): void {
    if (this.activeModuleIndex === index) {
      this.activeModuleIndex = null;
    } else {
      this.activeModuleIndex = index;
    }
  }
}