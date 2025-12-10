import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { adminGuard } from '../../core/guards/admin.guard';
import { AdminUsersComponent } from '../admin/users/admin-users.component';
import { AdminShelterOverviewComponent } from './shelter/admin-shelter-overview.component';
import { ShelterEditComponent } from '../shelter/shelter-edit/shelter-edit.component';
import { AdminAnimalsListComponent } from './animals/admin-animals-list/admin-animals-list.component';
import { AnimalFormComponent } from './animals/animal-form/animal-form.component';
import { AdminAdoptionRequestsListComponent } from './adoptions/admin-adoption-requests-list/admin-adoption-requests-list.component';
import { AdminAdoptionRequestComponent } from './adoptions/admin-adoption-request/admin-adoption-request.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'animals',
    children: [
      {
        path: '',
        component: AdminAnimalsListComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'create',
        component: AnimalFormComponent,
        canActivate: [adminGuard]
      },
      {
        path: ':id/edit',
        component: AnimalFormComponent,
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: 'adoptions',
    children: [
      {
        path: '',
        component: AdminAdoptionRequestsListComponent,
        canActivate: [adminGuard]
      },
      {
        path: ':id',
        component: AdminAdoptionRequestComponent,
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: 'shelter',
    children: [
      {
        path: '',
        component: AdminShelterOverviewComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'edit',
        component: ShelterEditComponent,
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: 'users',
    component: AdminUsersComponent,
    canActivate: [adminGuard]
  },
];
