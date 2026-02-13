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
        return this.http.post<{ success: boolean; exam: Examen }>(`${this.apiUrl}/preview`, params).pipe(
            map(response => response.exam)
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
    obtenerExamenes(userId?: string): Observable<Examen[]> {
        const url = userId ? `${this.apiUrl}/mis-examenes?userId=${userId}` : `${this.apiUrl}/mis-examenes`;
        return this.http.get<{ success: boolean; examenes: Examen[] }>(url).pipe(
            map(response => response.examenes)
        );
    }

    /**
     * Get draft exams for a user
     */
    obtenerBorradores(userId?: string): Observable<Examen[]> {
        const url = userId ? `${this.apiUrl}/borradores?userId=${userId}` : `${this.apiUrl}/borradores`;
        return this.http.get<{ success: boolean; borradores: Examen[] }>(url).pipe(
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

    // ============================================================================
    // SHARED EXAM & RESULTS METHODS
    // ============================================================================

    /**
     * Share exam via email
     */
    compartirExamen(id: string, emails: string[], userId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/compartir`, { emails, userId });
    }

    /**
     * Get session by token (for students)
     */
    obtenerSesionPorToken(token: string): Observable<any> {
        return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/sesion/${token}`).pipe(
            map(response => response.data)
        );
    }

    /**
     * Submit exam results from a shared session
     */
    enviarResultadosSesion(sesionId: string, studentData: any, answers: any[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/sesion/${sesionId}/submit`, { studentData, answers });
    }

    /**
     * Get all shared sessions and results for a teacher
     */
    obtenerSesionesConResultados(userId?: string): Observable<any[]> {
        const url = userId ? `${this.apiUrl}/sesiones/resultados?userId=${userId}` : `${this.apiUrl}/sesiones/resultados`;
        return this.http.get<{ success: boolean; sesiones: any[] }>(url).pipe(
            map(response => response.sesiones)
        );
    }

    /**
     * Verificar si un alumno ya ha realizado un examen en una sesión específica (por token)
     */
    verificarIntentoExistente(token: string, email: string): Observable<boolean> {
        return this.http.get<{ success: boolean; exists: boolean }>(
            `${this.apiUrl}/sesion/check/${token}?email=${email}`
        ).pipe(
            map(response => response.exists)
        );
    }

    /**
     * Eliminar una sesión de examen y sus resultados
     */
    eliminarSesion(id: string): Observable<void> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/sesion/${id}`).pipe(
            map(() => void 0)
        );
    }

    /**
     * Obtener detalles de un intento para revisión del alumno
     */
    obtenerDetallesIntento(intentoId: string): Observable<any> {
        return this.http.get<{ success: boolean; result: any }>(`${this.apiUrl}/intento/${intentoId}`).pipe(
            map(response => response.result)
        );
    }
}
