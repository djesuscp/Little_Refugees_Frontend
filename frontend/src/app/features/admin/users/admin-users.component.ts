import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { AdminUsersService, ShelterAdmin } from '../services/admin-users.service';
import { realEmailValidator } from '../../../shared/validators/email.validator';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {

  private adminUsersService = inject(AdminUsersService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private auth = inject(AuthService);

  allAdmins: ShelterAdmin[] = [];
  loading = false;

  // Form para añadir admin por email
  addAdminForm = this.fb.group({
    email: ['', [Validators.required, realEmailValidator]]
  });

  // Diálogo de reasignación
  showReassignDialog = false;
  adminToReassign: ShelterAdmin | null = null;

  reassignForm = this.fb.group({
    newAdminId: ['', [Validators.required]]
  });

  get currentUser(): User | null {
    return this.auth.getCurrentUser();
  }

  /** Admins mostrados en la tabla (sin el owner) */
  get displayedAdmins(): ShelterAdmin[] {
    const ownerId = this.currentUser?.id;
    return this.allAdmins.filter(a => a.id !== ownerId);
  }

  /** Candidatos para reasignar solicitudes (todos menos el que se va) */
  get reassignmentCandidates(): ShelterAdmin[] {
    if (!this.adminToReassign) return [];
    return this.allAdmins.filter(a => a.id !== this.adminToReassign!.id);
  }

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins() {
    this.loading = true;
    this.adminUsersService.getAdminsForMyShelter().subscribe({
      next: (admins) => {
        this.allAdmins = admins;
        this.loading = false;
      },
      error: () => {
        this.toastr.error('No se pudo cargar la lista de administradores.');
        this.loading = false;
      }
    });
  }

  onAddAdmin() {
    if (this.addAdminForm.invalid) return;

    const email = this.addAdminForm.value.email!;
    this.adminUsersService.addAdminByEmail(email).subscribe({
      next: () => {
        this.toastr.success('Administrador añadido correctamente.');
        this.addAdminForm.reset();
        this.loadAdmins();
      },
      error: (err) => {
        const msg = err.error?.message ?? 'Error al añadir administrador.';
        this.toastr.error(msg);
      }
    });
  }

  onClickRemoveAdmin(admin: ShelterAdmin) {
    this.adminUsersService.removeAdmin(admin.id).subscribe({
      next: () => {
        this.toastr.success('Administrador quitado de la protectora.');
        this.loadAdmins();
      },
      error: (err) => {
        const msg: string = err.error?.message ?? 'Error al quitar administrador.';

        // Mostrar mensaje del backend
        this.toastr.error(msg);

        // Si el backend indica que hay que reasignar solicitudes,
        // abrimos el diálogo de reasignación
        if (msg.toLowerCase().includes('reasignar')) {
          this.openReassignDialog(admin);
        }
      }
    });
  }

  openReassignDialog(admin: ShelterAdmin) {
    this.adminToReassign = admin;
    this.showReassignDialog = true;
    this.reassignForm.reset();
  }

  closeReassignDialog() {
    this.showReassignDialog = false;
    this.adminToReassign = null;
  }

  onSubmitReassign() {
    if (this.reassignForm.invalid || !this.adminToReassign) return;

    const adminToReassign = this.adminToReassign;
    const newAdminId = Number(this.reassignForm.value.newAdminId);

    this.adminUsersService
      .reassignAdoptionRequests(this.adminToReassign.id, newAdminId)
      .subscribe({
        next: () => {
          this.toastr.success('Solicitudes reasignadas correctamente.');
          this.closeReassignDialog();
          // Tras reasignar, intentamos de nuevo quitar al admin
          this.onClickRemoveAdmin(adminToReassign);
        },
        error: (err) => {
          const msg = err.error?.message ?? 'Error al reasignar solicitudes.';
          this.toastr.error(msg);
        }
      });
  }
}
