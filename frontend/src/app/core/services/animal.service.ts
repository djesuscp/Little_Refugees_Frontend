import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AnimalPublic, AnimalDetail } from '../models/animal.model';

export interface AnimalsQuery {
  search?: string;
  species?: string[];
  breeds?: string[];
  gender?: string[];
  ageMin?: number | null;
  ageMax?: number | null;
  orderBy?: 'age' | 'name' | 'createdAt';
  direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  shelterName?: string;    // Filtro por protectora (NO IMPLEMENTADO).
}

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private http = inject(HttpClient);
  private MAIN_URL = 'https://little-refugees-backend.onrender.com'
  private API_URL = `${this.MAIN_URL}/api/animals`;
  private ADOPTIONS_API = `${this.MAIN_URL}/api/adoptions`;

  getPublicAnimals(query: AnimalsQuery): Observable<AnimalPublic[]> {
    let params = new HttpParams();

    // Filtros.
    if (query.search) {
      params = params.set('name', query.search);
    }

    if (query.species && query.species.length > 0) {
      params = params.set('species', query.species.join(','));
    }

    if (query.breeds && query.breeds.length > 0) {
      params = params.set('breed', query.breeds.join(','));
    }

    if (query.gender && query.gender.length > 0) {
      params = params.set('gender', query.gender.join(','));
    }

    if (query.ageMin != null) {
      params = params.set('age_min', String(query.ageMin));
    }

    if (query.ageMax != null) {
      params = params.set('age_max', String(query.ageMax));
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

    // NO IMPLEMENTADO.
    if (query.shelterName) {
      params = params.set('shelter', query.shelterName);
    }

    return this.http.get<any>(this.API_URL, { params }).pipe(
      map((res) => {
        // Soporta tanto array como { animals: [ ... ] }.
        if (Array.isArray(res)) {
          return res as AnimalPublic[];
        }
        if (Array.isArray(res.animals)) {
          return res.animals as AnimalPublic[];
        }
        return [];
      })
    );
  }

  // Obtener detalle de un animal (GET /api/animals/:id).
  getAnimalDetail(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}`);
  }

  // Enviar solicitud de adopción (POST /api/adoptions).
  sendAdoptionRequest(animalId: number, message: string): Observable<any> {
    return this.http.post(this.ADOPTIONS_API, {
      animalId,
      message,
    });
  }

}

