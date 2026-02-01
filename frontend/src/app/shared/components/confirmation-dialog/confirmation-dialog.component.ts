import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
}

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
    isVisible = false;
    data: ConfirmationDialogData = {
        title: '',
        message: '',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        type: 'warning'
    };

    private resolvePromise?: (value: boolean) => void;

    show(data: Partial<ConfirmationDialogData>): Promise<boolean> {
        this.data = {
            ...this.data,
            ...data
        };
        this.isVisible = true;

        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    confirm(): void {
        this.isVisible = false;
        if (this.resolvePromise) {
            this.resolvePromise(true);
        }
    }

    cancel(): void {
        this.isVisible = false;
        if (this.resolvePromise) {
            this.resolvePromise(false);
        }
    }

    onBackdropClick(event: MouseEvent): void {
        if (event.target === event.currentTarget) {
            this.cancel();
        }
    }
}
