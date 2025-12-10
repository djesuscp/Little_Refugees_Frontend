import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { realEmailValidator } from '../../../shared/validators/email.validator';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { ConfirmPasswordDialogComponent } from '../../../shared/components/confirm-password-dialog/confirm-password-dialog.component';
import { ConfirmActionDialogComponent } from '../../../shared/components/confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmPasswordDialogComponent, ConfirmActionDialogComponent],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {

  private auth = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  user: User | null = null;

  roleLabels: Record<string, string> = {
    USER: 'usuario',
    ADMIN: 'administrador',
    OWNER: 'owner'
  };

  // Popups.
  showPasswordDialogForUpdate = false;
  showPasswordDialogForDelete = false;
  showConfirmDeleteDialog = false;

  private pendingDeletePassword: string | null = null;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, realEmailValidator]]
  });

  ngOnInit(): void {
    const u = this.auth.getCurrentUser();

    if (!u) {
      this.toastr.error('Debes iniciar sesión.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.user = u;
    this.form.patchValue({
      fullName: u.fullName,
      email: u.email
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.user) {
      this.toastr.error('Revisa los datos del formulario.');
      return;
    }

    this.showPasswordDialogForUpdate = true;
  }

  // Confirmación de contraseña para ACTUALIZAR perfil.
  onPasswordConfirmedForUpdate(password: string) {
    this.showPasswordDialogForUpdate = false;

    if (!this.user) return;

    const { fullName, email } = this.form.value;

    // Construir payload parcial para no enviar campos innecesarios.
    const payload: {
      fullName?: string;
      email?: string;
      currentPassword: string;
    } = {
      currentPassword: password
    };

    if (fullName && fullName !== this.user.fullName) {
      payload.fullName = fullName;
    }

    if (email && email !== this.user.email) {
      payload.email = email;
    }

    // Si no hay cambios, se notifica.
    if (!payload.fullName && !payload.email) {
      this.toastr.info('No hay cambios que guardar.');
      return;
    }

    this.userService.updateMyProfile(payload).subscribe({
      next: (updatedUser) => {
        this.toastr.success('Perfil actualizado correctamente.');
        this.auth.updateCurrentUser(updatedUser);
        this.user = updatedUser;
        this.auth.logout();
        this.router.navigate(['/']);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudo actualizar el perfil.';
        this.toastr.error(msg);
      }
    });
  }

  onPasswordDialogUpdateCancelled() {
    this.showPasswordDialogForUpdate = false;
  }

  // Cambiar a sección para editar la contraseña.
  goToChangePassword() {
    this.router.navigate(['/profile/change-password']);
  }

  // Botón para eliminar la cuenta.
  onClickDeleteAccount() {
    this.showPasswordDialogForDelete = true;
  }

  // Confirmación de contraseña para ELIMINAR cuenta.
  onPasswordConfirmedForDelete(password: string) {
    this.showPasswordDialogForDelete = false;

    this.pendingDeletePassword = password;

    // Diálogo de confirmación.
    this.showConfirmDeleteDialog = true;
  }

  onPasswordDialogDeleteCancelled() {
    this.showPasswordDialogForDelete = false;
    this.pendingDeletePassword = null;
  }

  onConfirmDeleteAction() {
    if (!this.pendingDeletePassword) return;

    this.userService.deleteMyAccount(this.pendingDeletePassword).subscribe({
      next: () => {
        this.toastr.success('Cuenta eliminada correctamente.');
        this.auth.logout();
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudo eliminar la cuenta.';
        this.toastr.error(msg);
      },
      complete: () => {
        this.showConfirmDeleteDialog = false;
        this.pendingDeletePassword = null;
      }
    });
  }

  onCancelDeleteAction() {
    this.showConfirmDeleteDialog = false;
    this.pendingDeletePassword = null;
  }
}
