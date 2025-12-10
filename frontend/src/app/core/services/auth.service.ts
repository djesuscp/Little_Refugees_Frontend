import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenStorageService } from './token-storage.service';
import { LoginResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private MAIN_URL = 'https://little-refugees-backend.onrender.com'
  private API_URL = `${this.MAIN_URL}/api/auth`;

  private currentUserSignal = signal<User | null>(null);
  currentUser$ = this.currentUserSignal.asReadonly();

  // Marca que indica si es justo después de un login.
  private justLoggedInSignal = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private tokenService: TokenStorageService
  ) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const token = this.tokenService.getToken();
    const user = this.tokenService.getUser();

    if (token && user) {
      this.currentUserSignal.set(user);
      // No es “justLoggedIn” al recargar, solo tras login real.
      this.justLoggedInSignal.set(false);
    }
  }

  // Petición de login al backend.
  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { email, password });
  }

  // Petición de registro al backend.
  register(data: any) {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  // Configuración de la sesión.
  setSession(token: string, user: User) {
    this.tokenService.saveToken(token);
    this.tokenService.saveUser(user);
    this.currentUserSignal.set(user);
    this.justLoggedInSignal.set(true);
  }

  // Se fuerza logout.
  logout() {
    this.tokenService.clear();
    this.currentUserSignal.set(null);
    this.justLoggedInSignal.set(false);
  }

  // Comprueba si existe login.
  isLoggedIn(): boolean {
    return !!this.tokenService.getToken();
  }

  // Obtener usuario actual.
  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  // Home indica que ya no es justo tras login.
  clearJustLoggedIn(): void {
    this.justLoggedInSignal.set(false);
  }

  // Actualizar el usuario tras complete-first-login, o tras /me
  updateCurrentUser(user: User): void {
    this.tokenService.saveUser(user);
    this.currentUserSignal.set(user);
  }
}
