import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface AdminAnimalPhoto {
  id: number;
  url: string;
}

export interface AdminAnimal {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  age: number | null;
  description: string | null;
  adopted: boolean;
  photos: AdminAnimalPhoto[];
  shelterId: number;
}

export interface AdminAnimalsQuery {
  name?: string;
  species?: string[];
  breeds?: string[];
  gender?: string[];
  ageMin?: number | null;
  ageMax?: number | null;
  adopted?: boolean;          // esto se ha generado como boolean | null, pero le he quitado el null.
  orderBy?: 'age';
  direction?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminAnimalService {
  private http = inject(HttpClient);
  private MAIN_URL = 'https://little-refugees-backend-latest.onrender.com'
  private API_URL = `${this.MAIN_URL}/api/animals/admin`;

  getAdminAnimals(query: AdminAnimalsQuery): Observable<AdminAnimal[]> {
    let params = new HttpParams();

    if (query.name) {
      params = params.set('name', query.name);
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

    // Filtro adoptados / no adoptados
    // if (query.adopted !== undefined) {
    //   params = params.set('adopted', String(query.adopted));
    // }
    if (query.adopted === true) {
      params = params.set('adopted', 'true');
    } else if (query.adopted === false) {
      params = params.set('adopted', 'false');
    }

    return this.http.get<any>(this.API_URL, { params }).pipe(                     // LUEGO CUIDADO CON ESTO.
      map((res) => {
        // backend: { message, page, limit, total, totalPages, animals }
        if (Array.isArray(res?.animals)) {
          return res.animals as AdminAnimal[];
        }
        return [];
      })
    );
  }

  /** Obtener un animal concreto para editar (GET /api/animals/admin/:id) */
  getAnimalById(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}`);
  }

  // getAnimalById(id: number): Observable<AdminAnimal> {
  //   return this.http.get<AdminAnimal>(`${this.API_URL}/${id}`);
  // }

  /** Payload para crear/editar animal */
  private buildPayloadFromForm(formValue: any, photoUrls: string[]) {
    // Aquí asumimos que el backend acepta `photos: string[]` para crear/actualizar
    return {
      name: formValue.name,
      species: formValue.species,
      breed: formValue.breed,
      gender: formValue.gender,
      age: formValue.age !== null && formValue.age !== '' ? Number(formValue.age) : null,
      description: formValue.description || null,
      adopted: !!formValue.adopted,
      //photos: photoUrls,
    };
  }

  /** Crear animal (POST /api/animals) */
  createAnimal(formValue: any, photoUrls: string[]): Observable<AdminAnimal> {
    const payload = this.buildPayloadFromForm(formValue, photoUrls);
    return this.http.post<AdminAnimal>(this.API_URL, payload);
  }

  /** Actualizar animal (PUT /api/animals/:id) */
  updateAnimal(id: number, formValue: any, photoUrls: string[]): Observable<AdminAnimal> {
    const payload = this.buildPayloadFromForm(formValue, photoUrls);
    return this.http.put<AdminAnimal>(`${this.API_URL}/${id}`, payload);
  }

    /** Eliminar animal (DELETE /api/animals/admin/:id) */
  deleteAnimal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // ---------------------------------------------------------------------------
  // *** CLOUDINARY: NUEVOS MÉTODOS PARA FOTOS
  // ---------------------------------------------------------------------------

  /** Obtener solo las fotos de un animal (GET /api/animals/admin/:id/photos) */
  getAnimalPhotos(animalId: number): Observable<AdminAnimalPhoto[]> {
    return this.http
      .get<{ photos: AdminAnimalPhoto[] }>(
        `${this.API_URL}/${animalId}/photos`
      )
      .pipe(map((res) => res.photos ?? []));
  }

  /**
   * Subir fotos (POST /api/animals/admin/:id/photos)
   * Campo multipart/form-data: "photos"
   */
  uploadAnimalPhotos(
    animalId: number,
    files: File[]
  ): Observable<AdminAnimalPhoto[]> {
    const formData = new FormData();

    // Campo "photos" (array de archivos)
    files.forEach((file) => {
      formData.append('photos', file);
    });

    return this.http
      .post<{ message: string; photos: AdminAnimalPhoto[] }>(
        `${this.API_URL}/${animalId}/photos`,
        formData
      )
      .pipe(map((res) => res.photos ?? []));
  }

  /**
   * Eliminar una foto concreta
   * DELETE /api/animals/admin/:animalId/photos/:photoId
   */
  deleteAnimalPhoto(animalId: number, photoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API_URL}/${animalId}/photos/${photoId}`
    );
  }

}

