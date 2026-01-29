import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ModuloJerarquia } from '../models/jerarquia.model';

@Injectable({
  providedIn: 'root'
})
export class JerarquiaService {
  // Ruta exacta indicada: backend/XML/DAMyDAW.xml
  private xmlUrl = 'assets/XML/DAMyDAW.xml';

  constructor(private http: HttpClient) { }

  getJerarquia(): Observable<ModuloJerarquia[]> {
    return this.http.get(this.xmlUrl, { responseType: 'text' }).pipe(
      map(xmlString => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        // Buscamos los nodos <Modulo>
        const modulosNodes = xmlDoc.getElementsByTagName('Modulo');
        const resultado: ModuloJerarquia[] = [];

        for (let i = 0; i < modulosNodes.length; i++) {
          const moduloNode = modulosNodes[i];
          const nombre = moduloNode.getAttribute('nombre') || '';

          // Buscamos los <RA> dentro de este módulo
          const rasNodes = moduloNode.getElementsByTagName('RA');
          const ras = [];

          for (let j = 0; j < rasNodes.length; j++) {
            ras.push({
              codigo: rasNodes[j].getAttribute('codigo') || '',
              texto: rasNodes[j].textContent?.trim() || ''
            });
          }

          resultado.push({ nombre, ras });
        }
        return resultado;
      })
    );
  }
}