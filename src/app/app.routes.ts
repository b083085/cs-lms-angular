import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { 
        path: 'books', 
        loadComponent: () => import('./components/book-list/book-list.component').then(m => m.BookListComponent)
      },
      { 
        path: 'borrowed', 
        loadComponent: () => import('./components/borrowed/borrowed.component').then(m => m.BorrowedComponent)
      },
      { 
        path: 'borrow-book', 
        loadComponent: () => import('./components/borrow-book/borrow-book.component').then(m => m.BorrowBookComponent)
      },
      { 
        path: 'return-book', 
        loadComponent: () => import('./components/return-book/return-book.component').then(m => m.ReturnBookComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];