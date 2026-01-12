import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
        children: [
            {
                path: 'dashboard',
                loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DashboardModule)
            },
            {
                path: 'preguntas',
                loadChildren: () => import('./features/preguntas/preguntas-module').then(m => m.PreguntasModule)
            },
            {
                path: 'examenes',
                loadChildren: () => import('./features/examenes/examenes-module').then(m => m.ExamenesModule)
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'dashboard' }
];
