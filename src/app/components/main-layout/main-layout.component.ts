import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  activeMenuItem = 'dashboard';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Listen to route changes to update active menu item
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        if (url.includes('/dashboard')) {
          this.activeMenuItem = 'dashboard';
        } else if (url.includes('/books')) {
          this.activeMenuItem = 'books';
        } else if (url.includes('/borrowed')) {
          this.activeMenuItem = 'borrowed';
        }
      });
  }

  navigateTo(route: string): void {
    this.activeMenuItem = route;
    this.router.navigate([`/${route}`]);
  }

  logout(): void {
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
}
