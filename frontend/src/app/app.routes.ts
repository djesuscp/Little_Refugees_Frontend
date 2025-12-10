import { Routes } from '@angular/router';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { ADMIN_ROUTES } from './features/admin/admin.routes';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: AUTH_ROUTES
  },

  // rutas protegidas dentro del layout
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadComponent: () =>
            import('./features/profile/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent)
          },
          {
            path: 'change-password',
            loadComponent: () =>
            import('./features/profile/profile-change-password/profile-change-password.component').then(m => m.ProfileChangePasswordComponent)
          }
        ]
      },
      {
        path: 'shelters/create',
        loadComponent: () =>
          import('./features/shelter/shelter-create/shelter-create.component').then(
            m => m.ShelterCreateComponent
          )
      },
      {
        path: 'animals',
        children: [
          {
            path: '',
            loadComponent: () =>
            import('./features/animals/animals-list/animals-list.component').then(m => m.AnimalsListComponent)
          },
          {
            path: 'detail/:id',
            loadComponent: () =>
            import('./features/animals/animal-detail/animal-detail.component').then(m => m.AnimalDetailComponent)
          }
        ]
      },
      {
        path: 'adoptions/me',
        loadComponent: () =>
          import('./features/adoptions/adoption-requests-list/adoption-requests-list.component')
            .then(m => m.AdoptionRequestsListComponent)
      },
      {
        path: 'admin',
        children: ADMIN_ROUTES
      }
      // {
      //   path: 'animals',
      //   loadComponent: () =>
      //     import('./features/animals/animals-list.component').then(m => m.AnimalsListComponent)
      // }
      // aquí irán todas las demás rutas de USER y ADMIN
    ]
  },

  { path: '**', redirectTo: '' }
];
