import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import {
  AdminAdoptionRequestsService,
  AdminAdoptionRequestDetail,
  AdoptionStatus
} from '../../services/admin-adoption-requests.service';
import { ConfirmActionDialogComponent } from '../../../../shared/components/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-adoption-request',
  standalone: true,
  imports: [CommonModule, ConfirmActionDialogComponent],
  templateUrl: './admin-adoption-request.component.html',
  styleUrls: ['./admin-adoption-request.component.scss']
})
export class AdminAdoptionRequestComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private adminAdoptionService = inject(AdminAdoptionRequestsService);

  request: AdminAdoptionRequestDetail | null = null;
  loading = false;

  // Para el diálogo de confirmación de cambio de estado.
  showConfirmDialog = false;
  pendingStatusChange: AdoptionStatus | null = null;

  // Diálogo específico para eliminar.
  showDeleteDialog = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!id || Number.isNaN(id)) {
      this.toastr.error('ID de solicitud inválido.');
      this.router.navigate(['/admin/adoptions']);
      return;
    }

    this.loadRequest(id);
  }

  private loadRequest(id: number) {
    this.loading = true;
    this.adminAdoptionService.getRequestById(id).subscribe({
      next: (req) => {
        this.request = req;
        this.loading = false;
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudo cargar la solicitud.';
        this.toastr.error(msg);
        this.loading = false;
        this.router.navigate(['/admin/adoptions']);
      }
    });
  }

  // Foto del animal (primera o placeholder).
  getAnimalPhotoUrl(): string {
    const firstPhoto = (this.request as any)?.animal?.photos?.[0]?.url;
    return firstPhoto || 'assets/images/animal/animal-placeholder.jpg';
  }

  // Etiqueta legible de estado.
  get statusLabel(): string {
    if (!this.request) return '';
    switch (this.request.status) {
      case 'PENDING': return 'Pendiente';
      case 'APPROVED': return 'Aprobada';
      case 'REJECTED': return 'Rechazada';
      default: return this.request.status;
    }
  }

  // Clase CSS según estado.
  get statusClass(): string {
    if (!this.request) return '';
    switch (this.request.status) {
      case 'PENDING': return 'status-pill pending';
      case 'APPROVED': return 'status-pill approved';
      case 'REJECTED': return 'status-pill rejected';
      default: return 'status-pill';
    }
  }

  // Solo se puede borrar si NO está aprobada
  get canDelete(): boolean {
    return !!this.request && this.request.status !== 'APPROVED';
  }

  // Texto dinámico para el confirm-action-dialog.
  get confirmMessage(): string {
    if (!this.pendingStatusChange) return '¿Confirmar cambio de estado?';

    const map: Record<AdoptionStatus, string> = {
      PENDING: '¿Seguro que quieres marcar esta solicitud como PENDIENTE?',
      APPROVED: '¿Seguro que quieres marcar esta solicitud como APROBADA?',
      REJECTED: '¿Seguro que quieres marcar esta solicitud como RECHAZADA?'
    };

    return map[this.pendingStatusChange];
  }

  // Acciones de botones.
  onMarkPending() {
    this.openStatusDialog('PENDING');
  }

  onMarkApproved() {
    this.openStatusDialog('APPROVED');
  }

  onMarkRejected() {
    this.openStatusDialog('REJECTED');
  }

  private openStatusDialog(status: AdoptionStatus) {
    this.pendingStatusChange = status;
    this.showConfirmDialog = true;
  }

  onConfirmStatusChange() {
    if (!this.request || !this.pendingStatusChange) return;

    const id = this.request.id;
    const newStatus = this.pendingStatusChange;

    this.showConfirmDialog = false;

    this.adminAdoptionService.updateRequestStatus(id, newStatus).subscribe({
      next: (updated) => {
        // Actualizamos estado local.
        this.request = updated;
        this.toastr.success(`Estado actualizado a ${updated.status}.`);
        this.router.navigate(['/admin/adoptions']);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudo actualizar el estado.';
        this.toastr.error(msg);
        // Si el backend dice que la solicitud no existe o no está autorizada, vuelve al listado.
        if (err.status === 404 || err.status === 403) {
          this.router.navigate(['/admin/adoptions']);
        }
      }
    });
  }

  onCancelStatusDialog() {
    this.showConfirmDialog = false;
    this.pendingStatusChange = null;
  }

  // Abrir diálogo de borrado
  onAskDelete() {
    if (!this.request || !this.canDelete) return;
    this.showDeleteDialog = true;
  }

  // Confirmar borrado
  onConfirmDelete() {
    if (!this.request) return;

    const id = this.request.id;
    this.showDeleteDialog = false;

    this.adminAdoptionService.deleteRequest(id).subscribe({
      next: (res) => {
        const msg = res?.message ?? 'Solicitud eliminada correctamente.';
        this.toastr.success(msg);
        this.router.navigate(['/admin/adoptions']);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudo eliminar la solicitud.';
        this.toastr.error(msg);
        if (err.status === 404 || err.status === 403) {
          this.router.navigate(['/admin/adoptions']);
        }
      }
    });
  }

  // Cancelar borrado
  onCancelDelete() {
    this.showDeleteDialog = false;
  }

  onBackToList() {
    this.router.navigate(['/admin/adoptions']);
  }
}
