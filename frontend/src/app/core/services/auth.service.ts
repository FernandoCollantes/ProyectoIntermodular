import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // MOCKED USERS
    private readonly MOCK_USERS = {
        'profesor.dam@example.com': {
            id: '1',
            name: 'Profesor DAM',
            email: 'profesor.dam@example.com',
            role: 'professor' as const,
            avatar: 'PD'
        },
        'profesor.daw@example.com': {
            id: '2',
            name: 'Profesor DAW',
            email: 'profesor.daw@example.com',
            role: 'professor' as const,
            avatar: 'PW'
        }
    };

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private currentCycleSubject = new BehaviorSubject<'DAM' | 'DAW' | null>(null);
    public currentCycle$ = this.currentCycleSubject.asObservable();

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(private router: Router) {
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

    login(email: string, password: string, cycle: 'DAM' | 'DAW'): Observable<boolean> {
        // Mock check
        const user = this.MOCK_USERS[email as keyof typeof this.MOCK_USERS];

        // In a real app we would check password hash, etc.
        if (user && password === 'pass123') { // Mock password for all

            // Update state
            this.currentUserSubject.next(user);
            this.currentCycleSubject.next(cycle);
            this.isAuthenticatedSubject.next(true);

            // Persist mock session
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('currentCycle', cycle);

            return of(true);
        }

        return of(false);
    }

    logout() {
        this.currentUserSubject.next(null);
        this.currentCycleSubject.next(null);
        this.isAuthenticatedSubject.next(false);

        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentCycle');

        this.router.navigate(['/auth/login']);
    }

    switchCycle() {
        const current = this.currentCycleSubject.value;
        if (current === 'DAM') {
            this.setCycle('DAW');
        } else {
            this.setCycle('DAM');
        }
    }

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
