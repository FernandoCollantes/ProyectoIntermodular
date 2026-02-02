import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ConfirmationService } from '../services/confirmation.service';
import { Observable, from } from 'rxjs';

/**
 * Interface that components should implement to be used with PendingChangesGuard
 */
export interface HasPendingChanges {
    hasPendingChanges(): boolean | Observable<boolean>;
}

/**
 * Guard that prevents navigation if the component has unsaved changes
 */
export const pendingChangesGuard: CanDeactivateFn<HasPendingChanges> = (component) => {
    const confirmationService = inject(ConfirmationService);

    if (component.hasPendingChanges && component.hasPendingChanges()) {
        return from(confirmationService.confirm({
            title: '¿Deseas salir?',
            message: 'Tienes cambios sin guardar. Si sales ahora, perderás todo el proceso.',
            confirmText: 'Sí, salir',
            cancelText: 'No, quedarme',
            type: 'warning'
        }));
    }

    return true;
};
