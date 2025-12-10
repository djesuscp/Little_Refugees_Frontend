import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { ShelterService } from '../../../core/services/shelter.service';
import { ConfirmPasswordDialogComponent } from '../../../shared/components/confirm-password-dialog/confirm-password-dialog.component';

@Component({
  selector: 'app-shelter-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmPasswordDialogComponent],
  templateUrl: './shelter-edit.component.html',
  styleUrls: ['./shelter-edit.component.scss']
})
export class ShelterEditComponent implements OnInit {

  private auth = inject(AuthService);
  private shelterService = inject(ShelterService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  shelterId!: number;
  showPasswordDialog = false;

  /** ⬅️ CAMBIO: guardamos los valores originales para detectar qué cambió */
  originalData: any = {}; // ⬅️ CAMBIO

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
    phone: ['', Validators.minLength(9)],
    description: [''],
  });

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user?.isAdminOwner || !user.shelterId) {
      this.toastr.error('No autorizado.');
      this.router.navigate(['/']);
      return;
    }

    this.shelterId = user.shelterId;
    this.loadShelter();
  }

  loadShelter() {
    this.shelterService.getShelterAdminView(this.shelterId).subscribe({
      next: (res) => {
        const s = res.shelter;

        this.originalData = {     // ⬅️ CAMBIO
          name: s.name,
          email: s.email,
          address: s.address,
          phone: s.phone ?? '',
          description: s.description ?? ''
        };

        this.form.patchValue(this.originalData);
      },
      error: () => {
        this.toastr.error('No se pudo cargar la información de la protectora.');
      }
    });
  }

  /** Paso 1: abrir popup de contraseña */
  onSubmit() {
    if (this.form.invalid) {
      this.toastr.error('Completa todos los campos obligatorios.');
      return;
    }

    this.showPasswordDialog = true;
  }

  /** Paso 2: usuario introduce contraseña en el popup */
  onPasswordConfirmed(password: string) {
    this.showPasswordDialog = false;

    /** ⬅️ CAMBIO: construir payload SOLO con los campos modificados */
    const payload: any = { currentPassword: password }; // ⬅️ CAMBIO

    const formValue = this.form.value;

    // Detectar qué campos han cambiado
    Object.keys(formValue).forEach(key => {
      if (formValue[key as keyof typeof formValue] !== this.originalData[key]) {
        payload[key] = formValue[key as keyof typeof formValue]; // ⬅️ CAMBIO
      }
    });

    this.shelterService.updateShelter(this.shelterId, payload).subscribe({
      next: () => {
        this.toastr.success('Protectora actualizada correctamente.');
        this.router.navigate(['/shelter']);
      },
      error: (err) => {
        const msg = err.error?.message ?? 'No se pudo actualizar la protectora.';
        this.toastr.error(msg);
      }
    });
  }

  /** Cancelar popup */
  onPasswordDialogCancelled() {
    this.showPasswordDialog = false;
  }
}

