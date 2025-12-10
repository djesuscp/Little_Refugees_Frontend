import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FirstLoginService {

  private getKey(userId: number): string {
    return `firstChoiceCompleted:${userId}`;
  }

  /** Devuelve true si el usuario ya hizo su elección */
  isFirstChoiceCompleted(userId: number): boolean {
    const value = localStorage.getItem(this.getKey(userId));
    return value === 'true';
  }

  /** Marca que el usuario ya ha elegido (gestionar o adoptar) */
  markFirstChoiceCompleted(userId: number): void {
    localStorage.setItem(this.getKey(userId), 'true');
  }
}

