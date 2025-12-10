import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ShelterService, ShelterOverview } from '../../../core/services/shelter.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-shelter-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-shelter-overview.component.html',
  styleUrls: ['./admin-shelter-overview.component.scss']
})
export class AdminShelterOverviewComponent implements OnInit {

  private shelterService = inject(ShelterService);
  private toastr = inject(ToastrService);
  private auth = inject(AuthService);

  shelter: ShelterOverview | null = null;
  loading = false;

  get currentUser(): User | null {
    return this.auth.getCurrentUser();
  }

  /** Solo el owner puede editar datos y gestionar admins */
  get isOwner(): boolean {
    return !!this.currentUser?.isAdminOwner;
  }

  ngOnInit(): void {
    this.loadShelter();
  }

  loadShelter() {
    this.loading = true;

    this.shelterService.getMyShelterOverview().subscribe({
      next: (shelter) => {
        this.shelter = shelter;
        this.loading = false;
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudo cargar la información de la protectora.';
        this.toastr.error(msg);
        this.loading = false;
      }
    });
  }
}
