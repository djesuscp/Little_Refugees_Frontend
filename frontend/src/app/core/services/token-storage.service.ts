import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private TOKEN_KEY = 'auth_token';
  private USER_KEY = 'auth_user';

  // Guardar token.
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Obtener token.
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Eliminar token.
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Guardar usuario.
  saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Obtener usuario.
  getUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  // Eliminar usuario.
  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Limpiar token y usuario.
  clear(): void {
    this.removeToken();
    this.removeUser();
  }
}

