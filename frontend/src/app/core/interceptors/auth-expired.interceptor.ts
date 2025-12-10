import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, EMPTY, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {

  private auth = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse) {
          const backendMsg: string =
            (typeof error.error === 'object' && error.error?.message)
              ? String(error.error.message)
              : String(error.error ?? '');

          const lower = backendMsg.toLowerCase();

          const isTokenError =
            error.status === 401 ||
            (error.status === 403 &&
              lower.includes('token') &&
              (lower.includes('inválido') || lower.includes('invalido') || lower.includes('expirado')));

          if (isTokenError) {
            // 🔹 Limpiar sesión (ajusta al método real de tu AuthService)
            this.auth.logout?.();

            // 🔹 Avisar al usuario
            this.toastr.error('Tu sesión ha expirado. Vuelve a iniciar sesión.', 'Sesión caducada');

            // 🔹 Redirigir (ajusta la ruta si tu login es otra, por ejemplo '/auth/login')
            this.router.navigate(['/login']);

            // 🔹 IMPORTANTE: no propagamos el error para evitar toasts duplicados en los componentes
            return EMPTY;
          }
        }

        // Para otros errores, seguimos como siempre
        return throwError(() => error);
      })
    );
  }
}

