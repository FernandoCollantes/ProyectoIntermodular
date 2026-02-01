import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ExamenService } from '../services/examen.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-compartir-examen',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './compartir-examen.component.html',
    styleUrls: ['./compartir-examen.component.scss']
})
export class CompartirExamenComponent {
    @Input() examId: string = '';
    @Input() examTitle: string = '';
    @Output() close = new EventEmitter<void>();

    shareForm: FormGroup;
    loading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private examenService: ExamenService,
        private notificacionService: NotificacionService,
        private authService: AuthService
    ) {
        this.shareForm = this.fb.group({
            emails: this.fb.array([this.createEmailControl()])
        });
    }

    get emails() {
        return this.shareForm.get('emails') as FormArray;
    }

    createEmailControl() {
        return this.fb.control('', [Validators.required, Validators.email]);
    }

    addEmail() {
        this.emails.push(this.createEmailControl());
    }

    removeEmail(index: number) {
        if (this.emails.length > 1) {
            this.emails.removeAt(index);
        }
    }

    onSubmit() {
        if (this.shareForm.valid) {
            this.loading = true;
            const emailsList = this.shareForm.value.emails;
            const user = this.authService.getCurrentUser();
            const userId = user?.id || 'invitado';

            this.examenService.compartirExamen(this.examId, emailsList, userId).subscribe({
                next: () => {
                    this.notificacionService.mostrar('Examen compartido con éxito', 'exito');
                    this.loading = false;
                    this.close.emit();
                },
                error: (err: any) => {
                    this.notificacionService.mostrar('Error al compartir: ' + err.message, 'error');
                    this.loading = false;
                }
            });
        } else {
            this.shareForm.markAllAsTouched();
        }
    }

    cancel() {
        this.close.emit();
    }
}
