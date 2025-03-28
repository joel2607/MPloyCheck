import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn 
): Observable<HttpEvent<unknown>> => {

  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    const isApiUrl = req.url.startsWith('http://localhost:8000/');

    if (token && isApiUrl) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // Pass the cloned request to the next handler
      return next(authReq).pipe( // Use the 'next' function passed in
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            console.error('Authentication Error (Interceptor):', error.message);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            router.navigate(['/signin'], { queryParams: { sessionExpired: true } });
          }
          return throwError(() => error);
        })
      );
    }
  }

  return next(req).pipe(
     catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error (Interceptor):', error);
        return throwError(() => error);
      })
  );
};