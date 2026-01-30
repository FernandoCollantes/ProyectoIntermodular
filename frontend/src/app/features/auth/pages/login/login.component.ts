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
            // cycle removed
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
            const { email, password } = this.loginForm.value;

            this.authService.login(email, password).subscribe({
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

    // Helper removed or simplified for dev testing if needed (but removed from template)
    fillMock(type: 'DAM' | 'DAW') {
        const email = type === 'DAM' ? 'profesor.dam@example.com' : 'profesor.daw@example.com';
        this.loginForm.patchValue({
            email: email,
            password: 'pass123'
        });
    }

    loginAsDemo() {
        this.fillMock('DAM');
        this.onSubmit();
    }
}
