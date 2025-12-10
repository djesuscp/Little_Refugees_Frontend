import { AbstractControl, ValidationErrors } from '@angular/forms';

export function realEmailValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  return regex.test(control.value) ? null : { realEmail: true };
}