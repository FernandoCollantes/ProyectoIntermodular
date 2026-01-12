import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { Examen, GenerateExamParams, DownloadExamDto, ApiResponse } from '@core/models';

@Injectable({
    providedIn: 'root'
})
export class ExamenService {
    private apiUrl = `${environment.apiUrl}/preguntas`;

    constructor(private http: HttpClient) { }

    generarPreview(params: GenerateExamParams): Observable<Examen> {
        return this.http.post<ApiResponse<Examen>>(`${this.apiUrl}/exam`, params).pipe(
            map(response => response.exam!)
        );
    }

    descargarPdf(dto: DownloadExamDto): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/download-pdf`, dto, {
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
}
