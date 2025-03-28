// src/app/auth.interceptor.ts
import { inject, PLATFORM_ID } from '@angular/core'; // Import inject
import { isPlatformBrowser } from '@angular/common';
import {
  HttpEvent,
  HttpHandlerFn, // Use HttpHandlerFn
  HttpRequest,
  HttpErrorResponse,
  HttpInterceptorFn // Use HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// Define the interceptor as a function matching HttpInterceptorFn
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn // Use HttpHandlerFn here
): Observable<HttpEvent<unknown>> => {

  // Inject dependencies inside the function
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // --- Logic remains largely the same, but without 'this' ---

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    const isApiUrl = req.url.startsWith('http://localhost:8000/'); // Adjust as needed

    console.log('Interceptor running...'); 
    console.log('Token:', token);

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

  // If no token or not browser/API URL, pass the original request
  return next(req).pipe( // Use the 'next' function passed in
     catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error (Interceptor):', error);
        return throwError(() => error);
      })
  );
};