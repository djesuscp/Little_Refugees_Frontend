import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface ShelterOverview {
  name: string;
  email: string;
  address: string;
  phone?: string | null;
  description?: string | null;
  animalsCount: number;
  adminsCount: number;
  currentAdmin: {
    id: number;
    fullName: string;
    email: string;
    isAdminOwner: boolean;
  };
}

export interface CreateShelterDto {
  name: string;
  email: string;
  address: string;
  phone?: string | null;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ShelterService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private MAIN_URL = 'https://little-refugees-backend-latest.onrender.com'
  private API_URL = `${this.MAIN_URL}/api/shelters`;

  /** Crear nueva protectora (ya lo tenías) */
  createShelter(payload: CreateShelterDto): Observable<any> {
    return this.http.post(`${this.API_URL}/create-shelter`, payload);
  }

  /**
   * Obtener datos de "Mi protectora" para el admin actual.
   * Llama a: GET /api/shelters/:id/admin
   */
  getMyShelterOverview(): Observable<ShelterOverview> {
    const currentUser = this.auth.getCurrentUser();

    if (!currentUser || !currentUser.shelterId) {
      throw new Error('El usuario actual no tiene una protectora asociada.');
    }

    const shelterId = currentUser.shelterId;

    return this.http
      .get<{ message: string; shelter: ShelterOverview }>(
        `${this.API_URL}/${shelterId}/admin`
      )
      .pipe(map(res => res.shelter));
  }

  getShelterAdminView(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}/admin`);
  }

  updateShelter(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, payload);
  }
}
