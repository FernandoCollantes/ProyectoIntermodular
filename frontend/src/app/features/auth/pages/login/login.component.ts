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
            cycle: ['', Validators.required], // DAM or DAW
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
            const { email, password, cycle } = this.loginForm.value;

            this.authService.login(email, password, cycle).subscribe({
                next: (success) => {
                    this.loading = false;
                    if (success) {
                        this.router.navigate(['/dashboard']); // or wherever
                    } else {
                        this.errorMsg = 'Credenciales incorrectas o usuario no encontrado.';
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

    // Helper to fill mock data quickly
    fillMock(type: 'DAM' | 'DAW') {
        if (type === 'DAM') {
            this.loginForm.patchValue({
                cycle: 'DAM',
                email: 'profesor.dam@example.com',
                password: 'pass123'
            });
        } else {
            this.loginForm.patchValue({
                cycle: 'DAW',
                email: 'profesor.daw@example.com',
                password: 'pass123'
            });
        }
    }
}
