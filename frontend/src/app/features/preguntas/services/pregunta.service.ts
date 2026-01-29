import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Pregunta, CrearPreguntaDto, ApiResponse } from '@core/models';

@Injectable({
    providedIn: 'root'
})
export class PreguntaService {
    private apiUrl = `${environment.apiUrl}/preguntas`;

    constructor(private http: HttpClient) { }

    /**
     * Search questions with filters.
     * Backend returns: { success: true, total_found: n, questions: [...] }
     */
    buscarPreguntas(filters: { subject?: string; difficulty?: string; theme?: string }): Observable<Pregunta[]> {
        let params = new HttpParams();
        if (filters.subject) params = params.set('subject', filters.subject);
        if (filters.difficulty) params = params.set('difficulty', filters.difficulty);
        if (filters.theme) params = params.set('theme', filters.theme);

        return this.http.get<ApiResponse<Pregunta[]>>(`${this.apiUrl}/search`, { params }).pipe(
            map(response => response.questions || [])
        );
    }

    /**
     * Envía la pregunta al backend de Andy.
     * El DTO ya sigue la estructura de Mongoose que vimos.
     */
    crearPregunta(dto: CrearPreguntaDto): Observable<Pregunta> {
        return this.http.post<{success: boolean, question: Pregunta}>(`${this.apiUrl}/`, dto).pipe(
            map(response => response.question)
        );
    }

    eliminarPregunta(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}

    /**
     * Get evaluation criteria based on subject.
     * MOCKED for now.
     */
    getCriterios(asignatura: string): Observable<string[]> {
        // Mock data
        const criteriosDAM = [
            'CE1. Interpreta el diseño de la base de datos',
            'CE2. Implementa consultas SQL complejas',
            'CE3. Desarrolla componentes de interfaz de usuario',
            'CE4. Realiza pruebas unitarias'
        ];

        const criteriosDAW = [
            'CE1. Diseña interfaces web responsive',
            'CE2. Implementa lógica de cliente con JavaScript',
            'CE3. Gestiona el despliegue de aplicaciones web',
            'CE4. Integra servicios RESTful'
        ];

        let criterios: string[] = [];
        if (asignatura === 'DAM') {
            criterios = criteriosDAM;
        } else if (asignatura === 'DAW') {
            criterios = criteriosDAW;
        }

        // Return as observable
        return new Observable(observer => {
            observer.next(criterios);
            observer.complete();
        });
    }
}
