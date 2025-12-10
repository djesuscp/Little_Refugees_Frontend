import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AnimalService, AnimalsQuery } from '../../../core/services/animal.service';
import { AnimalPublic } from '../../../core/models/animal.model';

@Component({
  selector: 'app-animals-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './animals-list.component.html',
  styleUrls: ['./animals-list.component.scss']
})
export class AnimalsListComponent implements OnInit {

  private fb = inject(FormBuilder);
  private animalService = inject(AnimalService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  animals: AnimalPublic[] = [];
  loading = false;

  // Paginación.
  currentPage = 1;
  readonly pageSize = 12; // Muestra 12 animales por página.
  hasMore = false;

  // Formulario de filtros y búsqueda.
  filtersForm = this.fb.group({
    search: [''],
    species: [''],    
    breeds: [''],     
    gender: [''],     
    ageMin: [''],
    ageMax: [''],
    shelterName: [''],
    orderByAgeDesc: [false],
    orderByAgeAsc: [false]
  });

  ngOnInit(): void {
    this.loadAnimals();
  }

  private buildQuery(): AnimalsQuery {
    const raw = this.filtersForm.value;

    const species = raw.species
      ? raw.species.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const breeds = raw.breeds
      ? raw.breeds.split(',').map(b => b.trim()).filter(Boolean)
      : [];

    const gender = raw.gender
      ? raw.gender.split(',').map(g => g.trim()).filter(Boolean)
      : [];

    const ageMin = raw.ageMin ? Number(raw.ageMin) : null;
    const ageMax = raw.ageMax ? Number(raw.ageMax) : null;

    const query: AnimalsQuery = {
      search: raw.search || undefined,
      species: species.length ? species : undefined,
      breeds: breeds.length ? breeds : undefined,
      gender: gender.length ? gender : undefined,
      ageMin,
      ageMax,
      shelterName: raw.shelterName || undefined,
      page: this.currentPage,
      limit: this.pageSize
    };

    if (raw.orderByAgeDesc) {
      query.orderBy = 'age';
      query.direction = 'desc';
    } else if (raw.orderByAgeAsc) {
      query.orderBy = 'age';
      query.direction = 'asc';
    }

    return query;
  }

  // Cargar animales.
  loadAnimals() {
    this.loading = true;

    const query = this.buildQuery();

    this.animalService.getPublicAnimals(query).subscribe({
      next: (animals) => {
        this.animals = animals;
        this.loading = false;
        // Si llega menos que el pageSize, asumimos que no hay más.
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
      search: '',
      species: '',
      breeds: '',
      gender: '',
      ageMin: '',
      ageMax: '',
      shelterName: '',
      orderByAgeDesc: false,
      orderByAgeAsc: false
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

  // Redirigir a la página del animal.
  onMoreInfo(animal: AnimalPublic) {
    this.router.navigate(['/animals/detail', animal.id]);
  }

  // Obtener url de la foto.
  getPhotoUrl(animal: AnimalPublic): string {
    const firstPhoto = animal.photos?.[0]?.url;
    return firstPhoto || '/assets/images/animal/animal-placeholder.jpg';
  }
}