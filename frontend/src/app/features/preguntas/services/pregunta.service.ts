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
    buscarPreguntas(filters: { subject?: string; difficulty?: string; theme?: string; creatorId?: string }): Observable<Pregunta[]> {
        let params = new HttpParams();
        // Backend key is 'asignatura', not 'subject'
        if (filters.subject) params = params.set('asignatura', filters.subject);
        if (filters.difficulty) params = params.set('difficulty', filters.difficulty);
        if (filters.theme) params = params.set('tema', filters.theme); // Also fix 'theme' -> 'tema' just in case backend expects 'tema' (it does)
        if (filters.creatorId) params = params.set('creador', filters.creatorId);

        return this.http.get<ApiResponse<Pregunta[]>>(`${this.apiUrl}/search`, { params }).pipe(
            map(response => response.questions || [])
        );
    }

    /**
     * Envía la pregunta al backend de Andy.
     * Transforma el DTO del frontend al formato esperado por el backend.
     */
    crearPregunta(dto: CrearPreguntaDto, creatorId: string): Observable<Pregunta> {
        // Backend changes:
        // 1. 'tema' expects a single RA code (e.g. "RA1"). We take the first one from criterios.
        // 2. 'respuesta_correcta' expects the INDEX (number).
        // 3. 'opciones' expects the full array of strings.

        const payload = {
            enunciado: dto.enunciado,
            asignatura: dto.asignatura,
            tema: dto.criterios[0] || 'RA1', // Fallback or take first
            dificultad: Number(dto.dificultad),
            opciones: dto.opciones,
            respuesta_correcta: parseInt(dto.respuesta_correcta, 10),
            creador: creatorId
        };

        // El endpoint ahora es /api/preguntas/add
        return this.http.post<{ success: boolean, question: Pregunta }>(`${this.apiUrl}/add`, payload).pipe(
            map(response => response.question)
        );
    }

    eliminarPregunta(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    obtenerPregunta(id: string): Observable<Pregunta> {
        return this.http.get<{ success: boolean, question: Pregunta }>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.question)
        );
    }

    actualizarPregunta(id: string, dto: CrearPreguntaDto, creatorId: string): Observable<Pregunta> {
        const payload = {
            enunciado: dto.enunciado,
            asignatura: dto.asignatura,
            tema: dto.criterios[0] || 'RA1',
            dificultad: Number(dto.dificultad),
            opciones: dto.opciones,
            respuesta_correcta: parseInt(dto.respuesta_correcta, 10),
            creador: creatorId
        };
        return this.http.put<{ success: boolean, question: Pregunta }>(`${this.apiUrl}/${id}`, payload).pipe(
            map(response => response.question)
        );
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
