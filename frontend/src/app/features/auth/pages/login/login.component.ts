import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
    loginForm: FormGroup;
    errorMsg: string = '';
    loading = false;
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            nombreCompleto: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
            ]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });

        // Clear error message when user types
        this.loginForm.valueChanges.subscribe(() => {
            if (this.errorMsg) {
                this.errorMsg = '';
            }
        });
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.loading = true;
            this.errorMsg = '';
            const { nombreCompleto, email, password } = this.loginForm.value;

            this.authService.login(nombreCompleto, email, password).subscribe({
                next: (result) => {
                    this.loading = false;
                    if (result.success) {
                        this.router.navigate(['/dashboard']); // or wherever
                    } else {
                        this.errorMsg = result.error || 'Error al iniciar sesión';
                    }
                },
                error: () => {
                    this.loading = false;
                    this.errorMsg = 'Ocurrió un error al intentar iniciar sesión.';
                }
            });
        } else {
            this.loginForm.markAllAsTouched();
        }
    }

}
