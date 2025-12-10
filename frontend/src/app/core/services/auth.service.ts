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

  // Marca si es justo después de un login
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
      // No es “justLoggedIn” al recargar, solo tras login real
      this.justLoggedInSignal.set(false);
    }
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { email, password });
  }

  register(data: any) {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  setSession(token: string, user: User) {
    this.tokenService.saveToken(token);
    this.tokenService.saveUser(user);
    this.currentUserSignal.set(user);
    this.justLoggedInSignal.set(true);
  }

  logout() {
    this.tokenService.clear();
    this.currentUserSignal.set(null);
    this.justLoggedInSignal.set(false);
  }

  isLoggedIn(): boolean {
    return !!this.tokenService.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  // Para saber si debemos mostrar el popup de primera vez
  // isJustLoggedIn(): boolean {
  //   return this.justLoggedInSignal();
  // }

  // Para que el Home pueda “marcar” que ya no es justo tras login
  clearJustLoggedIn(): void {
    this.justLoggedInSignal.set(false);
  }

  // Para actualizar el usuario tras complete-first-login, o tras /me
  updateCurrentUser(user: User): void {
    this.tokenService.saveUser(user);
    this.currentUserSignal.set(user);
  }
}
