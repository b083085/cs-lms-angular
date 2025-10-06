import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-borrow-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './borrow-book.component.html',
  styleUrl: './borrow-book.component.scss'
})
export class BorrowBookComponent {
  
  constructor(private router: Router) {}

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToBooks(): void {
    this.router.navigate(['/books']);
  }
}