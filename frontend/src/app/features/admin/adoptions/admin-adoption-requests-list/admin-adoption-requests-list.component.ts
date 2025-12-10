import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import {
  AdminAdoptionRequestsService,
  AdminAdoptionRequest,
  AdminAdoptionRequestsQuery,
  AdoptionStatus
} from '../../services/admin-adoption-requests.service';

@Component({
  selector: 'app-admin-adoption-requests-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-adoption-requests-list.component.html',
  styleUrls: ['./admin-adoption-requests-list.component.scss']
})
export class AdminAdoptionRequestsListComponent implements OnInit {

  private fb = inject(FormBuilder);
  private service = inject(AdminAdoptionRequestsService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  requests: AdminAdoptionRequest[] = [];
  loading = false;

  // Paginación (igual estilo que lista de animales).
  currentPage = 1;
  readonly pageSize = 10;
  hasMore = false;

  filtersForm = this.fb.group({
    animalName: [''],
    userName: [''],
    sortDirection: ['desc'], // 'desc' más reciente primero, 'asc' más antiguo primero
    statusPending: [true],
    statusApproved: [true],
    statusRejected: [true],
  });

  ngOnInit(): void {
    this.loadRequests();
  }

  private buildQuery(): AdminAdoptionRequestsQuery {
    const raw = this.filtersForm.value;

    const statuses: AdoptionStatus[] = [];
    if (raw.statusPending) statuses.push('PENDING');
    if (raw.statusApproved) statuses.push('APPROVED');
    if (raw.statusRejected) statuses.push('REJECTED');

    const query: AdminAdoptionRequestsQuery = {
      animalName: raw.animalName || undefined,
      userName: raw.userName || undefined,
      statuses: statuses.length ? statuses : undefined,
      orderBy: 'createdAt',
      direction: (raw.sortDirection as 'asc' | 'desc') || 'desc',
      page: this.currentPage,
      limit: this.pageSize
    };

    return query;
  }

  // Cargar solicitudes.
  loadRequests() {
    this.loading = true;
    const query = this.buildQuery();

    this.service.getAdminAdoptionRequests(query).subscribe({
      next: (requests) => {
        this.requests = requests;
        this.loading = false;
        this.hasMore = requests.length === this.pageSize;
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudieron cargar las solicitudes.';
        this.toastr.error(msg);
        this.loading = false;
        this.requests = [];
        this.hasMore = false;
      }
    });
  }

  onSearchSubmit() {
    this.currentPage = 1;
    this.loadRequests();
  }

  // Reiniciar filtros.
  onResetFilters() {
    this.filtersForm.reset({
      animalName: '',
      userName: '',
      sortDirection: 'desc',
      statusPending: true,
      statusApproved: true,
      statusRejected: true,
    });
    this.currentPage = 1;
    this.loadRequests();
  }

  // Paginación.
  onPrevPage() {
    if (this.currentPage <= 1) return;
    this.currentPage--;
    this.loadRequests();
  }

  onNextPage() {
    if (!this.hasMore) return;
    this.currentPage++;
    this.loadRequests();
  }

  onReviewRequest(req: AdminAdoptionRequest) {
    this.router.navigate(['/admin/adoptions', req.id]);
  }

  // Obtener estado de solicitud.
  getStatusLabel(status: AdoptionStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'APPROVED':
        return 'Aprobada';
      case 'REJECTED':
        return 'Rechazada';
      default:
        return status;
    }
  }

  getStatusClass(status: AdoptionStatus): string {
    switch (status) {
      case 'PENDING':
        return 'badge badge-pending';
      case 'APPROVED':
        return 'badge badge-approved';
      case 'REJECTED':
        return 'badge badge-rejected';
      default:
        return 'badge';
    }
  }

  // Obtener edad.
  getAnimalAgeLabel(req: AdminAdoptionRequest): string {
    const age = req.animal.age;
    if (age == null) return 'Edad no especificada';
    if (age === 1) return '1 año';
    return `${age} años`;
  }

  // Obtener la URL de la primera foto del animal o placeholder.
  getAnimalPhotoUrl(req: AdminAdoptionRequest): string {
    const first = (req.animal as any)?.photos?.[0]?.url;
    return first || 'assets/images/animal/animal-placeholder.jpg';
  }
}
