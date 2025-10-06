import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from the auth service
    const authToken = this.authService.getAuthToken();
    
    // Clone the request and add the authorization header if token exists
    if (authToken) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      return next.handle(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle 401 Unauthorized responses
          if (error.status === 401) {
            // Token might be expired or invalid
            console.log('Authentication failed - redirecting to login');
            this.authService.logout();
            // You might want to redirect to login page here
            // this.router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
    }
    
    // If no token, proceed with the original request
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
}
