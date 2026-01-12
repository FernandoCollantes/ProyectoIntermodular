import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { ApiResponse } from '@core/models';

@Injectable({
    providedIn: 'root'
})
export class AsignaturaService {
    private apiUrl = `${environment.apiUrl}/preguntas`;

    constructor(private http: HttpClient) { }

    getAsignaturas(): Observable<string[]> {
        return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/subjects`).pipe(
            map(response => response.subjects || [])
        );
    }

    getTemas(asignatura: string): Observable<string[]> {
        return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/themes`, {
            params: { subject: asignatura }
        }).pipe(
            map(response => response.themes || [])
        );
    }
}
