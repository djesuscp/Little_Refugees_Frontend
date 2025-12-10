export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  isAdminOwner: boolean;
  shelterId?: number | null;
  firstLoginCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}
