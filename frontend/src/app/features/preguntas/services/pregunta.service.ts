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
     * Create a new question.
     * Backend returns: { success: true, message: '...', question: {...} }
     */
    crearPregunta(dto: CrearPreguntaDto): Observable<Pregunta> {
        return this.http.post<any>(`${this.apiUrl}/`, dto).pipe(
            map(response => response.question)
        );
    }
}
