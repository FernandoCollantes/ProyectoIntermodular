import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { CursoJerarquia } from '../models/jerarquia.model';

@Injectable({
  providedIn: 'root'
})
export class JerarquiaService {
  // Ruta al archivo XML real (cuando Andy lo tenga listo) o a tu carpeta assets
  private readonly XML_URL = 'assets/data/jerarquia.xml'; 

  // Cache interna para no procesar el XML cada vez que cambiamos de página
  private cacheJerarquia: CursoJerarquia[] | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la jerarquía académica completa.
   * Actualmente preparada para pasar de Mock a Real fácilmente.
   */
  getCursos(): Observable<CursoJerarquia[]> {
    // 1. Si ya tenemos los datos en cache, los devolvemos para ahorrar recursos
    if (this.cacheJerarquia) {
      return of(this.cacheJerarquia);
    }

    // 2. Simulación de carga real (Cuando tengas el XML activo, usa la línea de abajo)
    // return this.cargarDesdeXML();

    // Por ahora, devolvemos un array vacío o el mock mínimo para que no de error
    // pero la estructura ya es la definitiva para recibir datos.
    return of([]).pipe(
      tap(datos => this.cacheJerarquia = datos)
    );
  }

  /**
   * MÉTODO PREPARADO: Este método se encargará de leer el XML real
   * y transformarlo en nuestros objetos de TypeScript.
   */
  private cargarDesdeXML(): Observable<CursoJerarquia[]> {
    return this.http.get(this.XML_URL, { responseType: 'text' }).pipe(
      map(xmlString => {
        const datosProcesados = this.parsearXML(xmlString);
        this.cacheJerarquia = datosProcesados;
        return datosProcesados;
      }),
      catchError(error => {
        console.error('Error crítico al leer el XML académico:', error);
        return throwError(() => new Error('No se pudo cargar la estructura académica.'));
      })
    );
  }

  /**
   * TRANSFORMADOR: Aquí es donde ocurrirá la magia de convertir 
   * las etiquetas del XML de Andy a nuestro modelo MVVM.
   */
  private parsearXML(xmlString: string): CursoJerarquia[] {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'text/xml');
    const resultados: CursoJerarquia[] = [];

    // NOTA PARA FERNANDO: Aquí implementaremos la lógica de recorrido del XML
    // una vez que Andy nos confirme las etiquetas finales (<modulo>, <ra>, etc.)
    
    return resultados;
  }

  /**
   * Limpia la cache si fuera necesario recargar los datos
   */
  limpiarCache(): void {
    this.cacheJerarquia = null;
  }
}