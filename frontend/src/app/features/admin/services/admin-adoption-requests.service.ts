import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type AdoptionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdminAdoptionRequestAnimal {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  age: number | null;
  description: string | null;
  adopted: boolean;
}

export interface AdminAdoptionRequestUser {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface AdminAdoptionRequest {
  id: number;
  message: string;
  status: AdoptionStatus;
  userId: number;
  animalId: number;
  createdAt: string;
  animal: AdminAdoptionRequestAnimal;
  user: AdminAdoptionRequestUser;
}

export interface AdminAdoptionRequestDetail {
  id: number;
  message: string;
  status: AdoptionStatus;
  userId: number;
  animalId: number;
  createdAt: string;
  animal: {
    id: number;
    name: string;
    species: string;
    breed: string;
    gender: string;
    age: number | null;
    description: string | null;
    adopted: boolean;
  };
  user: {
    id: number;
    fullName: string;
    email: string;
    createdAt: string;
  };
}

export interface AdminAdoptionRequestsQuery {
  animalName?: string;
  userName?: string;
  statuses?: AdoptionStatus[];
  orderBy?: 'createdAt';
  direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminAdoptionRequestsService {
  private http = inject(HttpClient);
  private MAIN_URL = 'https://little-refugees-backend.onrender.com'
  private API_URL = `${this.MAIN_URL}/api/adoptions`;

  getAdminAdoptionRequests(
    query: AdminAdoptionRequestsQuery
  ): Observable<AdminAdoptionRequest[]> {
    let params = new HttpParams();

    if (query.animalName) {
      params = params.set('animalName', query.animalName);
    }

    if (query.userName) {
      params = params.set('userName', query.userName);
    }

    if (query.statuses && query.statuses.length > 0) {
      // backend: status=PENDING,APPROVED,...
      params = params.set('status', query.statuses.join(','));
    }

    if (query.orderBy) {
      params = params.set('orderBy', query.orderBy);
    }

    if (query.direction) {
      params = params.set('direction', query.direction);
    }

    if (query.page != null) {
      params = params.set('page', String(query.page));
    }

    if (query.limit != null) {
      params = params.set('limit', String(query.limit));
    }

    return this.http.get<any>(`${this.API_URL}/shelter`, { params }).pipe(
      map((res) => {
        // backend: { message, page, limit, total, totalPages, requests }
        if (Array.isArray(res?.requests)) {
          return res.requests as AdminAdoptionRequest[];
        }
        // fallback por si algún día el backend devolviera solo un array
        if (Array.isArray(res)) {
          return res as AdminAdoptionRequest[];
        }
        return [];
      })
    );
  }

  // 👇 NUEVO: obtener una solicitud concreta (GET /api/adoptions/request/:id)
  getRequestById(id: number): Observable<AdminAdoptionRequestDetail> {
    return this.http.get<any>(`${this.API_URL}/request/${id}`).pipe(
      map(res => {
        // Soportar tanto objeto directo como { request: {...} }
        if (res && res.id && res.animal && res.user) {
          return res as AdminAdoptionRequestDetail;
        }
        if (res && res.request) {
          return res.request as AdminAdoptionRequestDetail;
        }
        throw new Error('Respuesta inesperada del backend al obtener la solicitud.');
      })
    );
  }

  // 👇 NUEVO: actualizar estado (PUT /api/adoptions/:id/status)
  updateRequestStatus(id: number, status: AdoptionStatus): Observable<AdminAdoptionRequestDetail> {
    return this.http.put<any>(`${this.API_URL}/${id}/status`, { status }).pipe(
      map(res => {
        // 🔥🔥 CAMBIO 1: aceptar el formato REAL del backend
        if (res && res.updatedRequest) {
          return res.updatedRequest as AdminAdoptionRequestDetail;
        }
        // De nuevo, soportar objeto directo o { request: {...} }
        if (res && res.id && res.animal && res.user) {
          return res as AdminAdoptionRequestDetail;
        }
        if (res && res.request) {
          return res.request as AdminAdoptionRequestDetail;
        }
        throw new Error('Respuesta inesperada del backend al actualizar el estado.');
      })
    );
  }

  // 🔹 NUEVO: eliminar solicitud (DELETE /api/adoptions/:id)
  deleteRequest(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }

}

