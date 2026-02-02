import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private apiUrl = environment.apiUrl || 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    generateQuestionFromPdf(asignatura: string, tema: string, numPreguntas: number, dificultad: number, pdfFile: File): Observable<any> {
        const formData = new FormData();
        formData.append('asignatura', asignatura);
        formData.append('tema', tema);
        formData.append('numPreguntas', numPreguntas.toString());
        formData.append('dificultad', dificultad.toString());
        formData.append('pdfFile', pdfFile);

        return this.http.post(`${this.apiUrl}/ai/upload-pdf`, formData);
    }
}
