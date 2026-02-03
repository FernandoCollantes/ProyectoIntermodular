import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private currentCycleSubject = new BehaviorSubject<'DAM' | 'DAW' | null>(null);
    public currentCycle$ = this.currentCycleSubject.asObservable();

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(private router: Router, private http: HttpClient) {
        // Check local storage on init (mock persistence)
        const storedUser = localStorage.getItem('currentUser');
        const storedCycle = localStorage.getItem('currentCycle');
        if (storedUser) {
            this.currentUserSubject.next(JSON.parse(storedUser));
            this.isAuthenticatedSubject.next(true);
        }
        if (storedCycle) {
            this.currentCycleSubject.next(storedCycle as 'DAM' | 'DAW');
        }
    }

    login(nombreCompleto: string, email: string, password: string): Observable<{ success: boolean; error?: string }> {
        return this.http.post<User>(`${this.apiUrl}/login`, { nombreCompleto, email, password }).pipe(
            map(user => {
                if (user) {
                    // Update state
                    this.currentUserSubject.next(user);
                    // Defaulting to DAM for internal compatibility
                    this.currentCycleSubject.next('DAM');
                    this.isAuthenticatedSubject.next(true);

                    // Persist session
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('currentCycle', 'DAM');

                    return { success: true };
                }
                return { success: false, error: 'Error desconocido' };
            }),
            catchError((error) => {
                const errorMessage = error.error?.message || 'Ocurrió un error al intentar iniciar sesión.';
                return of({ success: false, error: errorMessage });
            })
        );
    }

    logout() {
        this.currentUserSubject.next(null);
        this.currentCycleSubject.next(null);
        this.isAuthenticatedSubject.next(false);

        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentCycle');

        this.router.navigate(['/auth/acceso-profesor']);
    }

    // Removed switchCycle as requested

    // Internal helper if needed, or can be removed if not used elsewhere
    private setCycle(cycle: 'DAM' | 'DAW') {
        this.currentCycleSubject.next(cycle);
        localStorage.setItem('currentCycle', cycle);
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    getCurrentCycle(): 'DAM' | 'DAW' | null {
        return this.currentCycleSubject.value;
    }
}
