import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { UserService } from '../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent { // ⬅️ NUEVO: implements OnInit

  private auth = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // Para permitir cerrar el popup manualmente
  private dialogDismissed = false;

  get user(): User | null {
    return this.auth.getCurrentUser();
  }

  // ⬇️ NUEVO: helper para saber si es ROLE=USER
  get isUserRole(): boolean {
    return !!this.user && this.user.role === 'USER';
  }

  // Condición para mostrar el popup de primera vez
  get showFirstLoginDialog(): boolean {
    const u = this.user;
    return !!u && !u.firstLoginCompleted && !this.dialogDismissed;
  }

  onCloseFirstLoginDialog() {
    this.dialogDismissed = true;
    this.auth.clearJustLoggedIn();
  }

  onChooseManageShelter() {
    // No tocamos firstLoginCompleted aquí;
    // se gestionará en la página de creación de shelter cuando todo salga bien.
    this.auth.clearJustLoggedIn();
    this.router.navigate(['/shelters/create']);
  }

  onChooseAdopt() {
    this.userService.completeFirstLogin().subscribe({
      next: () => {
        const fullUser = {
          ...this.user!,
          firstLoginCompleted: true
        };

        this.auth.updateCurrentUser(fullUser);

        this.toastr.success('Configuración inicial completada. ¡Ya puedes empezar a adoptar!');

        this.dialogDismissed = true;
        this.auth.clearJustLoggedIn();
        this.router.navigate(['/']);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudo completar la configuración inicial.';
        this.toastr.error(msg);
      }
    });
  }

  // ⬇️ NUEVO: helpers usados por el nuevo home.component.html

  onSeeAnimals() {
    this.router.navigate(['/auth/login']);
  }

  onGoToRegister() {
    // Ajusta si tu ruta de registro es distinta
    this.router.navigate(['/auth/register']);
  }
}

