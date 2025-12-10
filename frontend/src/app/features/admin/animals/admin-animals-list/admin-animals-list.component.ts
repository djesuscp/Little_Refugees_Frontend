import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import {
  AdminAnimalService,
  AdminAnimalsQuery,
  AdminAnimal
} from '../../services/admin-animal.service';

@Component({
  selector: 'app-admin-animals-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-animals-list.component.html',
  styleUrls: ['./admin-animals-list.component.scss']
})
export class AdminAnimalsListComponent implements OnInit {

  private fb = inject(FormBuilder);
  private adminAnimalService = inject(AdminAnimalService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  animals: AdminAnimal[] = [];
  loading = false;

  // Paginación.
  currentPage = 1;
  readonly pageSize = 12;
  hasMore = false;

  // Formulario de filtros.
  filtersForm = this.fb.group({
    species: [''],        
    breeds: [''],         
    gender: [''],         
    ageMin: [''],
    ageMax: [''],
    orderByAgeDesc: [false],
    orderByAgeAsc: [false],
    showAdopted: [false],
    showNotAdopted: [false],
  });

  ngOnInit(): void {
    this.loadAnimals();
  }

  private buildQuery(): AdminAnimalsQuery {
    const raw = this.filtersForm.value;

    const species = raw.species
      ? raw.species.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const breeds = raw.breeds
      ? raw.breeds.split(',').map(b => b.trim()).filter(Boolean)
      : [];

    const genders = raw.gender
      ? raw.gender.split(',').map(g => g.trim()).filter(Boolean)
      : [];

    const ageMin = raw.ageMin ? Number(raw.ageMin) : null;
    const ageMax = raw.ageMax ? Number(raw.ageMax) : null;

    const query: AdminAnimalsQuery = {
      species: species.length ? species : undefined,
      breeds: breeds.length ? breeds : undefined,
      gender: genders.length ? genders : undefined,
      ageMin,
      ageMax,
      page: this.currentPage,
      limit: this.pageSize
    };

    // Orden por edad.
    if (raw.orderByAgeDesc && !raw.orderByAgeAsc) {
      query.orderBy = 'age';
      query.direction = 'desc';
    } else if (raw.orderByAgeAsc && !raw.orderByAgeDesc) {
      query.orderBy = 'age';
      query.direction = 'asc';
    }

    // Filtro adoptados/no adoptados.
    const showAdopted = !!raw.showAdopted;
    const showNotAdopted = !!raw.showNotAdopted;

    // Regla:
    // - Si ambos marcados -> no enviamos "adopted" (se ven todos).
    // - Si solo uno marcado -> enviamos adopted=true/false.
    // - Si ninguno marcado -> no enviamos "adopted" (se ven todos).
    if (showAdopted !== showNotAdopted) {
      // Solo uno es true.
      query.adopted = showAdopted ? true : false;
    }

    return query;
  }

  // Cargar animales.
  loadAnimals() {
    this.loading = true;

    const query = this.buildQuery();

    this.adminAnimalService.getAdminAnimals(query).subscribe({
      next: (animals) => {
        this.animals = animals;
        this.loading = false;
        this.hasMore = animals.length === this.pageSize;
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudieron cargar los animales.';
        this.toastr.error(msg);
        this.loading = false;
        this.animals = [];
        this.hasMore = false;
      }
    });
  }

  onSearchSubmit() {
    this.currentPage = 1;
    this.loadAnimals();
  }

  // Reiniciar filtros.
  onResetFilters() {
    this.filtersForm.reset({
      species: '',
      breeds: '',
      gender: '',
      ageMin: '',
      ageMax: '',
      orderByAgeDesc: false,
      orderByAgeAsc: false,
      showAdopted: false,
      showNotAdopted: false,
    });
    this.currentPage = 1;
    this.loadAnimals();
  }

  // Paginación.
  onPrevPage() {
    if (this.currentPage <= 1) return;
    this.currentPage--;
    this.loadAnimals();
  }

  onNextPage() {
    if (!this.hasMore) return;
    this.currentPage++;
    this.loadAnimals();
  }

  // Crear animal.
  onCreateAnimal() {
    this.router.navigate(['/admin/animals/create']);
  }

  // Editar animal.
  onEdit(animal: AdminAnimal) {
    this.router.navigate(['/admin/animals', animal.id, 'edit']);
  }

  // Obtener url de foto.
  getPhotoUrl(animal: AdminAnimal): string {
    const firstPhoto = animal.photos?.[0]?.url;
    return firstPhoto || '/assets/images/animal/animal-placeholder.jpg';
  }
}

