import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, map } from 'rxjs';

export interface ShelterAdmin {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private MAIN_URL = 'https://little-refugees-backend.onrender.com'
  private SHELTERS_API = `${this.MAIN_URL}/api/shelters`;
  private ADOPTIONS_API = `${this.MAIN_URL}/api/adoptions`;

  // Devuelve los admins del shelter del owner (incluyendo al owner).
  getAdminsForMyShelter(): Observable<ShelterAdmin[]> {
    const currentUser = this.auth.getCurrentUser();

    if (!currentUser || !currentUser.shelterId) {
      throw new Error('El usuario actual no tiene una protectora asociada.');
    }

    const shelterId = currentUser.shelterId;

    return this.http
      .get<{ message: string; admins: ShelterAdmin[] }>(
        `${this.SHELTERS_API}/${shelterId}/my-shelter-admins`
      )
      .pipe(map(res => res.admins)); // Obtener solo admins.
  }

  // Añadir admin por email.
  addAdminByEmail(email: string) {
    return this.http.post(`${this.SHELTERS_API}/add-admin`, { email });
  }

  // Quitar admin del shelter.
  removeAdmin(adminId: number) {
    return this.http.post(`${this.SHELTERS_API}/remove-admin`, { adminId });
  }

  // Reasignar solicitudes de adopción.
  reassignAdoptionRequests(adminId: number, newAdminId: number) {
    return this.http.post(`${this.ADOPTIONS_API}/reassign`, {
      adminId,
      newAdminId
    });
  }
}
