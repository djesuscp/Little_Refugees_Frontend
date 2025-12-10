import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-change-password.component.html',
  styleUrls: ['./profile-change-password.component.scss']
})
export class ProfileChangePasswordComponent {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private auth = inject(AuthService);

  // Formulario para ambiar contraseña.
  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPasswordConfirm: ['', Validators.required]
  });

  // Guardar cambios.
  onSubmit() {
    if (this.form.invalid) {
      this.toastr.error('Te has equivocado al introducir tu antigua contraseña, o la nueva contraseña no cumple con los requisitos mínimos de seguridad.');
      return;
    }

    const { currentPassword, newPassword, newPasswordConfirm } = this.form.value;

    if (newPassword !== newPasswordConfirm) {
      this.toastr.error('Las nuevas contraseñas no coinciden.');
      return;
    }

    const user = this.auth.getCurrentUser();
    if (!user) {
      this.toastr.error('No hay usuario autenticado.');
      return;
    }

    const payload = {
      fullName: user.fullName,
      email: user.email,
      currentPassword: currentPassword as string,
      newPassword: newPassword as string
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.auth.logout();
        this.toastr.success('Contraseña cambiada correctamente. Debes volver a iniciar sesión.');
        this.router.navigate(['/']);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudo cambiar la contraseña.';
        this.toastr.error(msg);
      }
    });
  }
}