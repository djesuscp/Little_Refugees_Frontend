import { User } from './user.model';

// Modelo para los datos del login.
export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export type { User };
