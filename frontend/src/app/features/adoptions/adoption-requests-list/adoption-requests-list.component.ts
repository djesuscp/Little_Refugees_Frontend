import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import {
  AdoptionRequestService,
  AdoptionRequest,
  AdoptionRequestStatus,
  AdoptionRequestsQuery
} from '../../../core/services/adoption-request.service';

@Component({
  selector: 'app-adoption-requests-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adoption-requests-list.component.html',
  styleUrls: ['./adoption-requests-list.component.scss'],
})
export class AdoptionRequestsListComponent implements OnInit {

  private fb = inject(FormBuilder);
  private adoptionRequestService = inject(AdoptionRequestService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  requests: AdoptionRequest[] = [];
  loading = false;

  // Formulario para filtros/orden.
  filtersForm = this.fb.group({
    orderDirection: ['desc'],
    statusPending: [true],
    statusApproved: [true],
    statusRejected: [true],
  });

  ngOnInit(): void {
    this.loadRequests();
  }

  private buildQuery(): AdoptionRequestsQuery {
    const raw = this.filtersForm.value;

    const statuses: AdoptionRequestStatus[] = [];

    if (raw.statusPending) {
      statuses.push('PENDING');
    }
    if (raw.statusApproved) {
      statuses.push('APPROVED');
    }
    if (raw.statusRejected) {
      statuses.push('REJECTED');
    }

    const direction = raw.orderDirection === 'asc' ? 'asc' : 'desc';

    const query: AdoptionRequestsQuery = {
      statuses: statuses.length ? statuses : undefined,
      orderBy: 'createdAt',
      direction,
    };

    return query;
  }

  // Obtener solicitudes.
  loadRequests() {
    this.loading = true;
    const query = this.buildQuery();

    this.adoptionRequestService.getMyRequests(query).subscribe({
      next: (requests) => {
        this.requests = requests;
        this.loading = false;
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudieron cargar las solicitudes de adopción.';
        this.toastr.error(msg);
        this.requests = [];
        this.loading = false;
      }
    });
  }

  // Aplicar filtros.
  onApplyFilters() {
    this.loadRequests();
  }

  // Reiniciar filtros.
  onResetFilters() {
    this.filtersForm.reset({
      orderDirection: 'desc',
      statusPending: true,
      statusApproved: true,
      statusRejected: true,
    });
    this.loadRequests();
  }

  // Obtener url de foto.
  getPhotoUrl(req: AdoptionRequest): string {
    const firstPhoto = req.animal?.photos?.[0]?.url;
    return firstPhoto || 'assets/images/animal/animal-placeholder.jpg';
  }

  // Obtener estado de la solicitud.
  getStatusLabel(status: AdoptionRequestStatus): string {
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

  getStatusClass(status: AdoptionRequestStatus): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  }

  // Redirigir a la página del animal.
  onMoreInfo(req: AdoptionRequest) {
    if (!req.animal || !req.animal.id) {
      this.toastr.error('No se ha podido identificar el animal.');
      return;
    }
    this.router.navigate(['/animals/detail', req.animal.id]);
  }
}
