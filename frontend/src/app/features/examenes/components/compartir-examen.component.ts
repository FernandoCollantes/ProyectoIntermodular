import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ExamenService } from '../services/examen.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';

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
        private authService: AuthService,
        private confirmationService: ConfirmationService
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

    async cancel() {
        const hasEmails = this.emails.controls.some(control => control.value && control.value.trim() !== '');

        if (hasEmails || this.emails.length > 1) {
            const confirmed = await this.confirmationService.confirm({
                title: '¿Cancelar compartir?',
                message: 'Se perderán los correos introducidos. ¿Deseas salir?',
                confirmText: 'Sí, salir',
                cancelText: 'Continuar editando',
                type: 'warning'
            });

            if (confirmed) {
                this.close.emit();
            }
        } else {
            this.close.emit();
        }
    }
}
