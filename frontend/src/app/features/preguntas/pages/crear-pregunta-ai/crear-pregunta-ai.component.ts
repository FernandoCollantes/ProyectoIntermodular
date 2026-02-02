import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { JerarquiaService } from '../../../../core/services/jerarquia.service';
import { AiService } from '../../../../core/services/ai.service';
import { PreguntaService } from '../../services/pregunta.service';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

// Models
import { ModuloJerarquia, ResultadoAprendizaje } from '../../../../core/models/jerarquia.model';

@Component({
    selector: 'app-crear-pregunta-ai',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './crear-pregunta-ai.component.html',
    styleUrls: ['./crear-pregunta-ai.component.scss']
})
export class CrearPreguntaAiComponent implements OnInit {
    public moduloHierarchy: ModuloJerarquia[] = [];
    public rasDisponibles: ResultadoAprendizaje[] = [];
    protected readonly String = String;

    selectedFile: File | null = null;
    fileName: string = '';
    isDragging: boolean = false;
    isGenerating: boolean = false;
    generatedQuestions: any[] = [];

    formData = {
        asignatura: '',
        tema: '',
        numPreguntas: 5,
        dificultad: 1 // 0: Fácil, 1: Media, 2: Difícil
    };

    constructor(
        private jerarquiaService: JerarquiaService,
        private aiService: AiService,
        private preguntaService: PreguntaService,
        private notiService: NotificacionService,
        private authService: AuthService,
        private confirmationService: ConfirmationService,
        public router: Router
    ) { }

    ngOnInit(): void {
        this.jerarquiaService.getJerarquia().subscribe({
            next: (data: ModuloJerarquia[]) => {
                this.moduloHierarchy = data;
            },
            error: () => this.notiService.mostrar('Error al cargar módulos', 'error')
        });
    }

    onSubjectChange(): void {
        const moduloSeleccionado = this.moduloHierarchy.find((m: ModuloJerarquia) => m.nombre === this.formData.asignatura);
        if (moduloSeleccionado) {
            this.rasDisponibles = moduloSeleccionado.ras;
            this.formData.tema = '';
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            this.selectedFile = file;
            this.fileName = file.name;
        } else {
            this.notiService.mostrar('Por favor, selecciona un archivo PDF válido', 'error');
        }
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragging = false;

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                this.selectedFile = file;
                this.fileName = file.name;
            } else {
                this.notiService.mostrar('Por favor, arrastra un archivo PDF válido', 'error');
            }
        }
    }

    removeFile(): void {
        this.selectedFile = null;
        this.fileName = '';
    }

    generateQuestions(): void {
        if (!this.formData.asignatura || !this.formData.tema) {
            this.notiService.mostrar('Por favor, selecciona módulo y RA', 'error');
            return;
        }

        if (!this.selectedFile) {
            this.notiService.mostrar('Por favor, sube un archivo PDF', 'error');
            return;
        }

        this.isGenerating = true;
        this.generatedQuestions = [];

        this.aiService.generateQuestionFromPdf(
            this.formData.asignatura,
            this.formData.tema,
            this.formData.numPreguntas,
            this.formData.dificultad,
            this.selectedFile
        ).subscribe({
            next: (response) => {
                this.isGenerating = false;
                if (response.success && response.questions && response.questions.length > 0) {
                    this.generatedQuestions = response.questions;
                    this.notiService.mostrar(`¡${this.generatedQuestions.length} preguntas generadas con éxito!`, 'exito');
                } else {
                    this.notiService.mostrar('No se pudieron generar las preguntas', 'error');
                }
            },
            error: (err) => {
                this.isGenerating = false;
                console.error('Error generating questions:', err);
                const errorMsg = err.error?.message || 'Error al generar las preguntas con IA';
                this.notiService.mostrar(errorMsg, 'error');
            }
        });
    }

    saveQuestions(): void {
        if (!this.generatedQuestions.length) return;

        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
            this.notiService.mostrar('Error: Usuario no identificado', 'error');
            return;
        }

        // Prepare questions for bulk saving
        const questionsToSave = this.generatedQuestions.map(q => ({
            ...q,
            creador: currentUser.id,
            // Ensure tema is an array as expected by the backend
            tema: Array.isArray(q.tema) ? q.tema : [q.tema]
        }));

        this.preguntaService.crearPreguntasBulk(questionsToSave).subscribe({
            next: () => {
                this.notiService.mostrar('¡Preguntas guardadas con éxito!', 'exito');
                this.router.navigate(['/preguntas']);
            },
            error: (err) => {
                console.error('Error saving questions:', err);
                const errorMsg = err.error?.message || 'Error al guardar las preguntas';
                this.notiService.mostrar(errorMsg, 'error');
            }
        });
    }

    regenerateQuestions(): void {
        this.generatedQuestions = [];
        this.generateQuestions();
    }

    async cancelar(): Promise<void> {
        const hasData = this.formData.asignatura || this.selectedFile || this.generatedQuestions.length > 0;

        if (hasData) {
            const confirmar = await this.confirmationService.confirm({
                title: '¿Cancelar generación de preguntas?',
                message: 'Se perderán todos los datos seleccionados y las preguntas generadas.',
                confirmText: 'Sí, cancelar',
                cancelText: 'No, continuar',
                type: 'warning'
            });

            if (confirmar) {
                this.router.navigate(['/preguntas']);
            }
        } else {
            this.router.navigate(['/preguntas']);
        }
    }

    getDificultadTexto(nivel: number): string {
        const niveles: Record<number, string> = {
            0: 'Fácil',
            1: 'Media',
            2: 'Difícil'
        };
        return niveles[nivel] || 'Media';
    }
}
