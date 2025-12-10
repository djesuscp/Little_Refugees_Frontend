import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type AdoptionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdoptionRequestAnimalShelter {
  name: string;
  email: string;
  address: string;
}

export interface AdoptionRequestAnimal {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  age: number | null;
  description: string | null;
  adopted: boolean;
  shelterId: number;
  photos: { id?: number; url: string }[];
  shelter: AdoptionRequestAnimalShelter;
}

export interface AdoptionRequest {
  id: number;
  message: string;
  status: AdoptionRequestStatus;
  userId: number;
  animalId: number;
  adminId: number | null;
  createdAt: string;
  animal: AdoptionRequestAnimal;
}

export interface AdoptionRequestsQuery {
  statuses?: AdoptionRequestStatus[];
  orderBy?: 'createdAt';
  direction?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class AdoptionRequestService {
  private http = inject(HttpClient);
  private MAIN_URL = 'https://little-refugees-backend.onrender.com'
  private API_URL = `${this.MAIN_URL}/api/adoptions/my-requests`;

  getMyRequests(query: AdoptionRequestsQuery): Observable<AdoptionRequest[]> {
    let params = new HttpParams();

    // Filtros por estado (status= PENDING, APPROVED, REJECTED).
    if (query.statuses && query.statuses.length > 0) {
      params = params.set('status', query.statuses.join(','));
    }

    // Ordenar.
    if (query.orderBy) {
      params = params.set('orderBy', query.orderBy);
    }
    if (query.direction) {
      params = params.set('direction', query.direction);
    }

    return this.http.get<any>(this.API_URL, { params }).pipe(
      map((res) => {
        // Soporta dos formatos: array puro o { requests: [...] }.
        if (Array.isArray(res)) {
          return res as AdoptionRequest[];
        }
        if (Array.isArray(res.requests)) {
          return res.requests as AdoptionRequest[];
        }
        return [];
      })
    );
  }
}

