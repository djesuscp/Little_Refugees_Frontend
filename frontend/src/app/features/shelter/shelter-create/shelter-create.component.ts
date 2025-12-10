import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ShelterService } from '../../../core/services/shelter.service';
import { realEmailValidator } from '../../../shared/validators/email.validator';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-shelter-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shelter-create.component.html',
  styleUrls: ['./shelter-create.component.scss']
})
export class ShelterCreateComponent {

  private fb = inject(FormBuilder);
  private shelterService = inject(ShelterService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private auth = inject(AuthService);

  loading = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, realEmailValidator]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    phone: [null, Validators.minLength(9)],
    description: [null]
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;

    this.shelterService.createShelter(this.form.value as any).subscribe({
      next: (res) => {
        this.toastr.success('Protectora creada correctamente. Ahora podrás gestionarla como administrador. Debes volver a iniciar sesión de nuevo.');
        this.loading = false;
        this.auth.updateCurrentUser(res.user);
        this.auth.logout();
        this.router.navigate(['/']);        
      },
      error: (err) => {
        const msg = err.error?.message ?? 'Error al crear la protectora.';
        this.toastr.error(msg);
        this.loading = false;
      }
    });
  }
}

