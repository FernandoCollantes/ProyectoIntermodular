export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    // Dynamic fields based on response type (questions, subjects, themes, etc.)
    // We can use intersection types or optional fields
    questions?: T;
    subjects?: T;
    themes?: T;
    exam?: T;
    total_found?: number;
}
