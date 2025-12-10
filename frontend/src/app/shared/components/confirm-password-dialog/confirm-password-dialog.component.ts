import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-confirm-password-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './confirm-password-dialog.component.html',
  styleUrls: ['./confirm-password-dialog.component.scss'],
})
export class ConfirmPasswordDialogComponent {
  loading = false;
  
  private fb = inject(FormBuilder);

  @Input() message = 'Se necesita tu contraseña para continuar:';

  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  form = this.fb.group({
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) return;

    const password = this.form.value.password!;
    this.confirm.emit(password);
    this.form.reset();
  }

  onClose() {
    this.form.reset();
    this.cancel.emit();
  }
}
