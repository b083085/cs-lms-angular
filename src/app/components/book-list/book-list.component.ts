import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Book {
  id: number;
  title: string;
  summary: string;
  isbn: string;
  published: number;
  genre: string;
  author: string;
  available: boolean;
}

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
  
  // Table sorting
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  
  // Sample books data
  books: Book[] = [];
  filteredBooks: Book[] = [];
  displayedBooks: Book[] = [];
  
  // Modal states
  showViewModal = false;
  showEditModal = false;
  showDeleteConfirm = false;
  selectedBook: Book | null = null;
  
  // User role (for demo purposes - in real app this would come from auth service)
  userRole = 'member'; // 'admin', 'librarian', 'member'

  ngOnInit(): void {
    this.initializeBooks();
    this.applyFilters();
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

  initializeBooks(): void {
    this.books = [
      { id: 1, title: 'The Great Gatsby', summary: 'A classic American novel set in the Jazz Age', isbn: '9780743273565', published: 1925, genre: 'Fiction', author: 'F. Scott Fitzgerald', available: true },
      { id: 2, title: 'To Kill a Mockingbird', summary: 'A gripping tale of racial injustice and childhood innocence', isbn: '9780061120084', published: 1960, genre: 'Fiction', author: 'Harper Lee', available: true },
      { id: 3, title: '1984', summary: 'A dystopian social science fiction novel', isbn: '9780452284234', published: 1949, genre: 'Dystopian Fiction', author: 'George Orwell', available: true },
      { id: 4, title: 'Pride and Prejudice', summary: 'A romantic novel of manners', isbn: '9780141439518', published: 1813, genre: 'Romance', author: 'Jane Austen', available: false },
      { id: 5, title: 'The Catcher in the Rye', summary: 'A coming-of-age story', isbn: '9780316769174', published: 1951, genre: 'Fiction', author: 'J.D. Salinger', available: true },
      { id: 6, title: 'Lord of the Flies', summary: 'A story about British boys stranded on an island', isbn: '9780571056866', published: 1954, genre: 'Allegory', author: 'William Golding', available: true },
      { id: 7, title: 'The Hobbit', summary: 'A fantasy novel about a hobbit\'s adventure', isbn: '9780547928227', published: 1937, genre: 'Fantasy', author: 'J.R.R. Tolkien', available: false },
      { id: 8, title: 'Animal Farm', summary: 'An allegorical novella about farm animals', isbn: '9780451526342', published: 1945, genre: 'Allegory', author: 'George Orwell', available: true },
      { id: 9, title: 'Jane Eyre', summary: 'A bildungsroman about a young woman', isbn: '9780141441146', published: 1847, genre: 'Gothic Fiction', author: 'Charlotte Brontë', available: true },
      { id: 10, title: 'The Lord of the Rings', summary: 'An epic high-fantasy novel', isbn: '9780544003415', published: 1954, genre: 'Fantasy', author: 'J.R.R. Tolkien', available: true },
      { id: 11, title: 'Wuthering Heights', summary: 'A tale of passion and revenge', isbn: '9780141439556', published: 1847, genre: 'Gothic Fiction', author: 'Emily Brontë', available: false },
      { id: 12, title: 'Brave New World', summary: 'A dystopian social science fiction novel', isbn: '9780060850524', published: 1932, genre: 'Science Fiction', author: 'Aldous Huxley', available: true },
      { id: 13, title: 'The Chronicles of Narnia', summary: 'A series of fantasy novels', isbn: '9780064404990', published: 1950, genre: 'Fantasy', author: 'C.S. Lewis', available: true },
      { id: 14, title: 'The Grapes of Wrath', summary: 'A novel about the Great Depression', isbn: '9780143039433', published: 1939, genre: 'Fiction', author: 'John Steinbeck', available: true },
      { id: 15, title: 'One Hundred Years of Solitude', summary: 'A magical realist novel', isbn: '9780060883287', published: 1967, genre: 'Magical Realism', author: 'Gabriel García Márquez', available: false },
      { id: 16, title: 'The Picture of Dorian Gray', summary: 'A philosophical novel about beauty and morality', isbn: '9780141439570', published: 1890, genre: 'Gothic Fiction', author: 'Oscar Wilde', available: true },
      { id: 17, title: 'Crime and Punishment', summary: 'A psychological thriller about crime and redemption', isbn: '9780143058144', published: 1866, genre: 'Psychological Fiction', author: 'Fyodor Dostoevsky', available: true },
      { id: 18, title: 'The Adventures of Huckleberry Finn', summary: 'A novel about friendship and freedom', isbn: '9780142437179', published: 1884, genre: 'Adventure', author: 'Mark Twain', available: true },
      { id: 19, title: 'The Scarlet Letter', summary: 'A novel about sin and redemption in Puritan society', isbn: '9780142437261', published: 1850, genre: 'Historical Fiction', author: 'Nathaniel Hawthorne', available: false },
      { id: 20, title: 'Frankenstein', summary: 'A Gothic novel about creation and responsibility', isbn: '9780141439471', published: 1818, genre: 'Gothic Fiction', author: 'Mary Shelley', available: true }
    ];
  }

  applyFilters(): void {
    this.filteredBooks = this.books.filter(book => {
      const matchesAuthor = !this.authorFilter || book.author === this.authorFilter;
      const matchesYear = !this.yearFilter || book.published.toString() === this.yearFilter;
      const matchesAvailability = !this.availabilityFilter || 
        (this.availabilityFilter === 'available' && book.available) ||
        (this.availabilityFilter === 'unavailable' && !book.available);
      const matchesSearch = !this.searchTerm || 
        book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.isbn.includes(this.searchTerm) ||
        book.genre.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesAuthor && matchesYear && matchesAvailability && matchesSearch;
    });
    
    this.totalPages = Math.ceil(this.filteredBooks.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updateDisplayedBooks();
  }

  updateDisplayedBooks(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedBooks = this.filteredBooks.slice(startIndex, endIndex);
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.filteredBooks.sort((a, b) => {
      let aValue = (a as any)[column];
      let bValue = (b as any)[column];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (this.sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    this.updateDisplayedBooks();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '↕️';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateDisplayedBooks();
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
    this.applyFilters();
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
      const index = this.books.findIndex(book => book.id === this.selectedBook!.id);
      if (index !== -1) {
        this.books[index] = { ...this.selectedBook };
        this.applyFilters(); // Refresh the filtered data
      }
    }
    this.closeEditModal();
  }

  // Confirm delete
  confirmDelete(): void {
    if (this.selectedBook) {
      const index = this.books.findIndex(book => book.id === this.selectedBook!.id);
      if (index !== -1) {
        this.books.splice(index, 1);
        this.applyFilters(); // Refresh the filtered data
      }
    }
    this.closeDeleteConfirm();
  }
}