import { User } from './user.model';

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export type { User };
