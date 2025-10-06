import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from './auth.service';

// Re-export User interface for convenience
export type { User };

export interface DashboardData {
  cards: DashboardCard[];
  tables: DashboardTable[];
  lists: DashboardList[];
}

export interface DashboardCard {
  label: string;
  metrics: number;
}

export interface DashboardTable {
  title: string;
  columns: string[];
  items: any[];
}

export interface DashboardList {
  title: string;
  items: string[];
}

export interface DashboardRequest {
  userId: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = environment.apiUrl;
  private dashboardDataSubject = new BehaviorSubject<DashboardData | null>(null);
  public dashboardData$ = this.dashboardDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get dashboard data for the current user
  getDashboardData(request: DashboardRequest): Observable<DashboardData> {
    const url = `${this.API_URL}/dashboard?userId=${request.userId}&role=${request.role}`;
    console.log('DashboardService: Making GET request to:', url);
    
    return this.http.get<DashboardData>(url)
      .pipe(
        tap(data => {
          console.log('DashboardService: Received data:', data);
          this.dashboardDataSubject.next(data);
        })
      );
  }

  // Clear dashboard data (useful for logout)
  clearDashboardData(): void {
    this.dashboardDataSubject.next(null);
  }

  // Debug method to test the API manually
  testDashboardAPI(userId: string, role: string): Observable<any> {
    const url = `${this.API_URL}/dashboard?userId=${userId}&role=${role}`;
    console.log('Testing dashboard API with URL:', url);
    
    // Make a simple GET request to test
    return this.http.get(url);
  }
}
