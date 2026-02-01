import { Injectable, ComponentRef, ViewContainerRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationService {
    private dialogComponentRef?: ComponentRef<ConfirmationDialogComponent>;

    constructor(
        private appRef: ApplicationRef,
        private injector: EnvironmentInjector
    ) { }

    async confirm(data: Partial<ConfirmationDialogData>): Promise<boolean> {
        // Create component if it doesn't exist
        if (!this.dialogComponentRef) {
            this.dialogComponentRef = createComponent(ConfirmationDialogComponent, {
                environmentInjector: this.injector
            });

            // Attach to application
            this.appRef.attachView(this.dialogComponentRef.hostView);
            const domElem = (this.dialogComponentRef.hostView as any).rootNodes[0] as HTMLElement;
            document.body.appendChild(domElem);
        }

        // Show dialog and wait for result
        return this.dialogComponentRef.instance.show(data);
    }

    destroy(): void {
        if (this.dialogComponentRef) {
            this.appRef.detachView(this.dialogComponentRef.hostView);
            this.dialogComponentRef.destroy();
            this.dialogComponentRef = undefined;
        }
    }
}
