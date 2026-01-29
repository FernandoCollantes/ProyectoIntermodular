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
     * Busca preguntas con filtros (Módulo, Dificultad, RA).
     * El backend devuelve: { success: true, total_found: n, questions: [...] }
     */
    buscarPreguntas(filters: { subject?: string; difficulty?: string; theme?: string }): Observable<Pregunta[]> {
        let params = new HttpParams();
        
        // Mapeamos los filtros a los parámetros que espera el backend de Andy
        if (filters.subject) params = params.set('subject', filters.subject);
        if (filters.difficulty) params = params.set('difficulty', filters.difficulty);
        if (filters.theme) params = params.set('theme', filters.theme);

        return this.http.get<ApiResponse<Pregunta[]>>(`${this.apiUrl}/search`, { params }).pipe(
            map(response => response.questions || [])
        );
    }

    /**
     * Crea una nueva pregunta vinculada a un Módulo y un RA (enviado como theme).
     * El backend devuelve: { success: true, message: '...', question: {...} }
     */
    crearPregunta(dto: CrearPreguntaDto): Observable<Pregunta> {
        // Enviamos el DTO simplificado (sin el campo criterios)
        return this.http.post<any>(`${this.apiUrl}/`, dto).pipe(
            map(response => response.question)
        );
    }

    /**
     * NOTA: El método getCriterios ha sido eliminado siguiendo la decisión 
     * de omitir esta funcionalidad en el flujo académico.
     */
}