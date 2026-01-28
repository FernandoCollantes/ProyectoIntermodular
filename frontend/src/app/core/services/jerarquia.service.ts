import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CursoJerarquia } from '@core/models/jerarquia.model';

@Injectable({
  providedIn: 'root'
})
export class JerarquiaService {
  // Cuando Andy esté listo, esto será: private apiUrl = `${environment.apiUrl}/jerarquia`;
  
  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los títulos/cursos disponibles.
   * Por ahora, devuelve la estructura fiel al XML que me pasaste.
   */
  getCursos(): Observable<CursoJerarquia[]> {
    // Simulamos la respuesta de la API basándonos en tu XML de Administración y Finanzas
    const data: CursoJerarquia[] = [
      {
        _id: 'ADG03S',
        nombre: 'Administración y Finanzas',
        asignaturas: [
          {
            _id: '0179',
            nombre: 'Inglés profesional GS',
            resultados_aprendizaje: [
              {
                codigo: '1',
                nombre: 'Comprende información profesional...',
                criterios: [
                  { codigo: 'a', nombre: 'Se ha identificado la idea principal...' },
                  { codigo: 'b', nombre: 'Se ha reconocido la finalidad...' }
                ]
              }
            ]
          }
        ]
      }
    ];
    return of(data);
  }
}