export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'professor';
    avatar?: string;
    // We can add more fields as needed
}
