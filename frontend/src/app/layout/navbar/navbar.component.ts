import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  get user() {
    return this.auth.getCurrentUser();
  }

  login() {
    this.router.navigate(['/auth/login']);
  }

  logout() {
    this.auth.logout();
    this.toastr.info('Sesión cerrada');
    this.router.navigate(['/']);
  }
}

