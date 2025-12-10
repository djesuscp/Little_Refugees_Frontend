import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { realEmailValidator } from '../../../shared/validators/email.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})

export class RegisterComponent {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  loading = false;

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, realEmailValidator]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;

    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.toastr.success('Registro completado. Ahora puedes iniciar sesión.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'Error al registrarse.';
        this.toastr.error(msg);
        this.loading = false;
      }
    });
  }
}