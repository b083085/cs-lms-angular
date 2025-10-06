import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';

import { routes } from './app.routes';

// Create a functional interceptor for the new approach
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Functional interceptor triggered for:', req.url);
  
  // Get token from localStorage directly (since we can't inject services in functional interceptors)
  const authToken = localStorage.getItem('authToken');
  console.log('Functional interceptor: Token available:', !!authToken);
  
  if (authToken) {
    console.log('Functional interceptor: Adding Bearer token');
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    return next(authRequest);
  }
  
  console.log('Functional interceptor: No token, proceeding without auth header');
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
