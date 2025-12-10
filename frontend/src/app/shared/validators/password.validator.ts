import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('newPasswordConfirm')?.value;

  return password === confirmPassword ? null : { passwordsMismatch: true };
}