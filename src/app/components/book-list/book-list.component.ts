import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookService, CreateBookRequest, BookListResponse, Book } from '../../services/book.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent implements OnInit {
  authorFilter = '';
  yearFilter = '';
  availabilityFilter = '';
  searchTerm = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private bookService: BookService
  ) {}
  
  // Table sorting
  sortColumn = '';
  sortDirection: 'Ascending' | 'Descending' = 'Ascending';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Sample books data
  books: Book[] = [];
  
  // Modal states
  showViewModal = false;
  showEditModal = false;
  showCreateModal = false;
  showDeleteConfirm = false;
  selectedBook: Book | null = null;
  newBook: Book | null = null;
  
  // User role (for demo purposes - in real app this would come from auth service)
  userRole = 'member'; // 'admin', 'librarian', 'member'

  ngOnInit(): void {
    this.loadBooks('', '', 'Ascending', 1, 10);
    this.loadUserRole();
  }

  loadUserRole(): void {
    // In a real app, this would come from an auth service
    // For demo purposes, we'll simulate different roles based on login
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      this.userRole = storedRole;
    } else {
      // Default to member role
      this.userRole = 'member';
    }
  }

  applyFilters(): void {
    this.loadBooks(this.searchTerm, this.sortColumn, this.sortDirection, 1, this.itemsPerPage);
  }

  loadBooks(searchTerm:string | '', sortBy:string | '', sortDirection:string | '', page:number | 1, pageSize:number | 10): void {
    this.bookService.getBooks(searchTerm, sortBy, sortDirection, page, pageSize).subscribe({
      next: (response) => {
        this.books = response.items;
        this.itemsPerPage = response.pageSize;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(response.total / this.itemsPerPage);
        this.currentPage = response.page;
      },
      error: (err) => {
        console.error('Failed to fetch books:', err);
      }
    });
  }
  

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'Ascending' ? 'Descending' : 'Ascending';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'Ascending';
    }
    
    this.loadBooks(this.searchTerm, this.sortColumn, this.sortDirection, this.currentPage, this.itemsPerPage);
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕️';
    return this.sortDirection === 'Ascending' ? '↑' : '↓';
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadBooks(this.searchTerm, this.sortColumn, this.sortDirection, this.currentPage, this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  clearFilters(): void {
    this.authorFilter = '';
    this.yearFilter = '';
    this.availabilityFilter = '';
    this.searchTerm = '';
    this.loadBooks(this.searchTerm, this.sortColumn, this.sortDirection, this.currentPage, this.itemsPerPage);
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Check if user can perform admin actions
  canPerformAdminActions(): boolean {
    return this.userRole === 'admin' || this.userRole === 'librarian';
  }

  // Modal actions
  viewBook(book: Book): void {
    this.selectedBook = book;
    this.showViewModal = true;
  }

  editBook(book: Book): void {
    this.selectedBook = { ...book }; // Create a copy for editing
    this.showEditModal = true;
  }

  deleteBook(book: Book): void {
    this.selectedBook = book;
    this.showDeleteConfirm = true;
  }

  // Modal close actions
  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedBook = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedBook = null;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.selectedBook = null;
  }

  // Save edited book
  saveBook(): void {
    if (this.selectedBook) {
      const index = this.books.findIndex(book => book.bookId === this.selectedBook!.bookId);
      if (index !== -1) {
        this.books[index] = { ...this.selectedBook };
        this.loadBooks(this.searchTerm, this.sortColumn, this.sortDirection, this.currentPage, this.itemsPerPage);
      }
    }
    this.closeEditModal();
  }

  createNewBook(): void {
      if (this.newBook) {
        // Use BookService to create a new book
        // Assuming BookService.createBook returns an Observable<Book>
        // Map newBook to BookRequest
        const bookRequest: CreateBookRequest = {
          title: this.newBook.title,
          summary: this.newBook.summary,
          isbn: this.newBook.isbn,
          publishedOn: this.newBook.publishedOn,
          totalCopies: this.newBook.totalCopies,
          genre: this.newBook.genre.genreId,
          author: this.newBook.author.authorId
        };
        this.bookService.addBook(bookRequest).subscribe({
          next: (createdBook: Book) => {
            // Optionally map BookResponse to local Book type if needed
            this.books.push({
              bookId: createdBook.bookId,
              title: createdBook.title,
              summary: createdBook.summary,
              isbn: createdBook.isbn,
              publishedOn: createdBook.publishedOn,
              genre: createdBook.genre,
              author: createdBook.author,
              totalCopies: createdBook.totalCopies,
              availability: createdBook.availability // or use a field from response if available
            });
            this.loadBooks(this.searchTerm, this.sortColumn, this.sortDirection, this.currentPage, this.itemsPerPage);
            this.closeCreateModal();
          },
          error: (err: any) => {
            // Handle error (show notification, etc.)
            console.error('Failed to create book:', err);
          }
        });
      } else {
        this.closeCreateModal();
      }
  }

  // Confirm delete
  confirmDelete(): void {
    if (this.selectedBook) {
      const index = this.books.findIndex(book => book.bookId === this.selectedBook!.bookId);
      if (index !== -1) {
        this.books.splice(index, 1);
        this.loadBooks(this.searchTerm, this.sortColumn, this.sortDirection, this.currentPage, this.itemsPerPage);
      }
    }
    this.closeDeleteConfirm();
  }

  // Check if user is a borrower
  isBorrower(): boolean {
    const userRole = this.authService.getCurrentUserRole();
    return userRole === 'borrower';
  }

  // Navigate to create book page
  createBook(): void {
    this.newBook = { bookId: '', title: '', summary: '', isbn: '', publishedOn: new Date().toISOString().split('T')[0], totalCopies: 1, genre: { genreId: '', name: '' }, author: { authorId: '', name: '' }, availability: 'available' };
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newBook = null;
  }
}