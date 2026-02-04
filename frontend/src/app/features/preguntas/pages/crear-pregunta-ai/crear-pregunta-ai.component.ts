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
import { HasPendingChanges } from '../../../../core/guards/pending-changes.guard';

@Component({
    selector: 'app-crear-pregunta-ai',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './crear-pregunta-ai.component.html',
    styleUrls: ['./crear-pregunta-ai.component.scss']
})
export class CrearPreguntaAiComponent implements OnInit, HasPendingChanges {
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
        const { asignatura, tema, numPreguntas, dificultad } = this.formData;

        if (!asignatura || !numPreguntas || dificultad === undefined || dificultad === null) {
            this.notiService.mostrar('Por favor, completa los campos obligatorios del formulario', 'error');
            return;
        }

        if (numPreguntas < 1 || numPreguntas > 20) {
            this.notiService.mostrar('El número de preguntas debe estar entre 1 y 20', 'error');
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
                    this.generatedQuestions = response.questions.map((q: any) => ({
                        ...q,
                        asignatura: this.formData.asignatura, // Garantizar que tiene la asignatura
                        isEditing: false,
                        tempData: { ...q, asignatura: this.formData.asignatura }
                    }));
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

    toggleEdit(index: number): void {
        const q = this.generatedQuestions[index];
        if (q.isEditing) {
            // Cancel editing, restore from original
            q.tempData = { ...q };
            q.tempData.isEditing = undefined;
            q.tempData.tempData = undefined;
        } else {
            // Start editing
            q.tempData = JSON.parse(JSON.stringify(q));
        }
        q.isEditing = !q.isEditing;
    }

    toggleRa(index: number, raCodigo: string): void {
        const q = this.generatedQuestions[index];
        const target = q.isEditing ? q.tempData : q;
        if (!target.tema) target.tema = [];
        if (!Array.isArray(target.tema)) target.tema = [target.tema];

        const idx = target.tema.indexOf(raCodigo);
        if (idx > -1) {
            target.tema.splice(idx, 1);
        } else {
            target.tema.push(raCodigo);
        }
    }

    isRaSelected(index: number, raCodigo: string): boolean {
        const q = this.generatedQuestions[index];
        const target = q.isEditing ? q.tempData : q;
        if (!target.tema) return false;
        if (!Array.isArray(target.tema)) return target.tema === raCodigo;
        return target.tema.includes(raCodigo);
    }

    saveIndividualQuestion(index: number): void {
        const q = this.generatedQuestions[index];
        const dataToSave = q.isEditing ? q.tempData : q;

        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
            this.notiService.mostrar('Error: Usuario no identificado', 'error');
            return;
        }

        if (!dataToSave.tema || (Array.isArray(dataToSave.tema) && dataToSave.tema.length === 0)) {
            this.notiService.mostrar('Asigna al menos un RA antes de guardar', 'error');
            return;
        }

        // Limpiar el array de temas (eliminar vacíos)
        let temasFinales = Array.isArray(dataToSave.tema) ? dataToSave.tema : [dataToSave.tema];
        temasFinales = temasFinales.filter((t: string) => t && t.trim() !== "");

        const question: any = {
            enunciado: dataToSave.enunciado,
            opciones: dataToSave.opciones,
            respuesta_correcta: String(dataToSave.respuesta_correcta), // Convertir a string para el DTO
            asignatura: dataToSave.asignatura || this.formData.asignatura,
            tema: temasFinales,
            dificultad: dataToSave.dificultad,
            creador: currentUser.id
        };

        console.log('Intentando guardar pregunta IA:', question);

        this.preguntaService.crearPregunta(question, currentUser.id).subscribe({
            next: () => {
                this.notiService.mostrar('Pregunta guardada con éxito', 'exito');
                this.generatedQuestions.splice(index, 1);
            },
            error: (err) => {
                console.error('Error saving question:', err);
                const msg = err.error?.message || 'Error al guardar la pregunta';
                this.notiService.mostrar(msg, 'error');
            }
        });
    }

    discardQuestion(index: number): void {
        this.generatedQuestions.splice(index, 1);
        if (this.generatedQuestions.length === 0) {
            this.notiService.mostrar('Todas las preguntas han sido procesadas', 'exito');
        }
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

    hasPendingChanges(): boolean {
        // Retornamos true si hay datos en el formulario o preguntas generadas no guardadas
        return !!(this.formData.asignatura || this.selectedFile || this.generatedQuestions.length > 0);
    }
}
