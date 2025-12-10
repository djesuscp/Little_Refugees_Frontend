import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

  private MAIN_URL = 'https://little-refugees-backend.onrender.com'
  private API_URL = `${this.MAIN_URL}/api/users`;

  constructor(private http: HttpClient) {}

  updateMyProfile(payload: {
    fullName?: string;
    email?: string;
    currentPassword: string;
  }): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/me`, payload);
  }

  changePassword(payload: {
    fullName: string;
    email: string;
    currentPassword: string;
    newPassword: string;
  }): Observable<User> {
    // Mismo endpoint que updateMyProfile: PUT /api/users/me
    return this.http.put<User>(`${this.API_URL}/me`, payload);
  }

  // changePassword(payload: { currentPassword: string; newPassword: string }) {
  //   return this.http.put(`${this.API_URL}/me`, payload);
  // }

  /**
   * Eliminar mi cuenta.
   * DELETE /api/users/me con body { currentPassword }
   */
  deleteMyAccount(currentPassword: string): Observable<{ message: string }> {
    return this.http.request<{ message: string }>(
      'DELETE',
      `${this.API_URL}/me`,
      {
        body: { currentPassword }
      }
    );
  }

  // updateMyProfile(data: Partial<User>): Observable<User> {
  //   return this.http.put<User>(`${this.API_URL}/me`, data);
  // }

  // deleteMyAccount() {
  //   return this.http.delete(`${this.API_URL}/me`);
  // }

  deleteUserByOwner(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  // Marca firstLoginCompleted = true manteniendo el rol USER
  completeFirstLogin() {
    return this.http.put<User>(`${this.API_URL}/first-login`, { firstLoginCompleted: true });
  }
}
