import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DashboardService, DashboardData, User, DashboardRequest } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData: DashboardData | null = null;
  currentUser: User | null = null;
  isLoading = true;
  errorMessage = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Wait for user to be authenticated before loading dashboard
    const authSub = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.loadDashboardData();
      } else {
        // If no user, redirect to login
        this.router.navigate(['/login']);
      }
    });
    
    this.subscriptions.push(authSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Get current user data
    const currentUser = this.authService.getCurrentUser();
    const userId = this.authService.getCurrentUserId();
    const userRole = this.authService.getCurrentUserRole();
    const authToken = this.authService.getAuthToken();

    console.log('Dashboard: Current user:', currentUser);
    console.log('Dashboard: User ID:', userId);
    console.log('Dashboard: User Role:', userRole);
    console.log('Dashboard: Auth Token available:', !!authToken);
    
    // Debug token details
    this.authService.debugToken();

    // Create dashboard request
    const dashboardRequest: DashboardRequest = {
      userId: userId,
      role: userRole
    };

    console.log('Dashboard: Making request with:', dashboardRequest);

    const dashboardSub = this.dashboardService.getDashboardData(dashboardRequest).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Dashboard loading error:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to view the dashboard.';
        } else {
          this.errorMessage = 'Failed to load dashboard data. Please try again.';
        }
      }
    });

    this.subscriptions.push(dashboardSub);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}