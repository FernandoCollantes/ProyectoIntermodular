import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Examen, GenerateExamParams, DownloadExamDto, ApiResponse } from '@core/models';

@Injectable({
    providedIn: 'root'
})
export class ExamenService {
    private apiUrl = `${environment.apiUrl}/examenes`;

    constructor(private http: HttpClient) { }

    // Legacy methods for exam preview
    generarPreview(params: GenerateExamParams): Observable<Examen> {
        return this.http.post<ApiResponse<Examen>>(`${environment.apiUrl}/preguntas/exam`, params).pipe(
            map(response => response.exam!)
        );
    }

    descargarPdf(dto: DownloadExamDto): Observable<Blob> {
        return this.http.post(`${environment.apiUrl}/preguntas/download-pdf`, dto, {
            responseType: 'blob'
        });
    }

    // Helper method to trigger browser download
    guardarArchivo(blob: Blob, nombreArchivo: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    // ============================================================================
    // NEW EXAM MANAGEMENT METHODS (Draft/Published System)
    // ============================================================================

    /**
     * Create a new exam (draft or published)
     */
    crearExamen(examen: Examen): Observable<Examen> {
        return this.http.post<{ success: boolean; exam: Examen }>(`${this.apiUrl}`, examen).pipe(
            map(response => response.exam)
        );
    }

    /**
     * Get published exams for a user
     */
    obtenerExamenes(userId: string): Observable<Examen[]> {
        return this.http.get<{ success: boolean; examenes: Examen[] }>(
            `${this.apiUrl}/mis-examenes?userId=${userId}`
        ).pipe(
            map(response => response.examenes)
        );
    }

    /**
     * Get draft exams for a user
     */
    obtenerBorradores(userId: string): Observable<Examen[]> {
        return this.http.get<{ success: boolean; borradores: Examen[] }>(
            `${this.apiUrl}/borradores?userId=${userId}`
        ).pipe(
            map(response => response.borradores)
        );
    }

    /**
     * Get exam by ID
     */
    obtenerExamenPorId(id: string): Observable<Examen> {
        return this.http.get<{ success: boolean; exam: Examen }>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.exam)
        );
    }

    /**
     * Update exam
     */
    actualizarExamen(id: string, examen: Partial<Examen>): Observable<Examen> {
        return this.http.put<{ success: boolean; exam: Examen }>(`${this.apiUrl}/${id}`, examen).pipe(
            map(response => response.exam)
        );
    }

    /**
     * Delete exam
     */
    eliminarExamen(id: string): Observable<void> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
            map(() => void 0)
        );
    }

    /**
     * Publish a draft exam
     */
    publicarExamen(id: string): Observable<Examen> {
        return this.http.patch<{ success: boolean; exam: Examen }>(`${this.apiUrl}/${id}/publicar`, {}).pipe(
            map(response => response.exam)
        );
    }
}
