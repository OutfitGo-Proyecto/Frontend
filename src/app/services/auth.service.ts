// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor() { }

    // Simular Registro
    register(userData: any): Observable<any> {
        // Obtenemos usuarios existentes o un array vacío
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Verificar si el email ya existe
        const userExists = users.find((u: any) => u.email === userData.email);
        if (userExists) {
            return throwError(() => new Error('El usuario ya existe'));
        }

        // Guardar nuevo usuario
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));

        return of({ success: true, message: 'Registro exitoso' });
    }

    // Simular Login
    login(credentials: any): Observable<any> {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Buscar usuario por email y contraseña
        const user = users.find((u: any) =>
            u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
            // Guardar token simulado (o flag de sesión)
            localStorage.setItem('token', 'token-falso-123456');
            return of({ success: true, user: user });
        } else {
            return throwError(() => new Error('Credenciales incorrectas'));
        }
    }

    logout() {
        localStorage.removeItem('token');
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }
}
