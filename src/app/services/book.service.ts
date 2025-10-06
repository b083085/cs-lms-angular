import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Book {
  bookId: string;
  title: string;
  summary: string;
  isbn: string;
  publishedOn: string;
  totalCopies: number;
  availability: string;
  genre: Genre;
  author: Author;
}

export interface CreateBookRequest {
  title: string;
  summary: string;
  isbn: string;
  publishedOn: string;
  totalCopies: number;
  genreId: string;
  authorId: string;
}

export interface Genre {
  genreId: string;
  name: string;
}

export interface Author {
  authorId: string;
  name: string;
}

export interface BookListResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Book[];
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly API_URL = environment.apiUrl;
  private booksSubject = new BehaviorSubject<BookListResponse | null>(null);
  private genresSubject = new BehaviorSubject<Genre[] | null>(null);
  private authorsSubject = new BehaviorSubject<Author[] | null>(null);
  public books$ = this.booksSubject.asObservable();
  public genres$ = this.genresSubject.asObservable();
  public authors$ = this.authorsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Get all books
  getBooks(author:string | '', year: number | 0, availability:string | '', searchTerm:string | '', sortBy:string | '', sortDirection:string | 'Ascending', page:number, pageSize:number): Observable<BookListResponse> {
    const url = `${this.API_URL}/books?page=${page}&pageSize=${pageSize}&searchTerm=${searchTerm}&sortBy=${sortBy}&sortDirection=${sortDirection}&author=${author}&publishedYear=${year}&availability=${availability}`;
    console.log('BookService: Making GET request to:', url);
    
    return this.http.get<BookListResponse>(url)
      .pipe(
        tap(books => {
          console.log('BookService: Received books:', books);
          this.booksSubject.next(books);
        })
      );
  }

  // Get a specific book by ID
  getBook(id: string): Observable<Book> {
    const url = `${this.API_URL}/books/${id}`;
    console.log('BookService: Making GET request to:', url);
    
    return this.http.get<Book>(url);
  }

  // Add a new book
  addBook(request: CreateBookRequest): Observable<Book> {
    const url = `${this.API_URL}/books`;
    console.log('BookService: Making POST request to:', url, 'with data:', request);

    return this.http.post<Book>(url, request)
      .pipe(
        tap(newBook => {
          console.log('BookService: Added new book:', newBook);
          const currentBooksResponse = this.booksSubject.getValue();
          if (currentBooksResponse && Array.isArray(currentBooksResponse.items)) {
            const updatedItems = [...currentBooksResponse.items, newBook];
            this.booksSubject.next({
              ...currentBooksResponse,
              items: updatedItems,
              total: currentBooksResponse.total + 1
            });
          } else {
            // If no current books, initialize with the new book
            this.booksSubject.next({
              page: 1,
              pageSize: 1,
              total: 1,
              items: [newBook]
            });
          }
        })
      );
  }

  // Update an existing book
  updateBook(book: Book): Observable<any> {
    const url = `${this.API_URL}/books`;
    console.log('BookService: Making PUT request to:', url, 'with data:', book);
    return this.http.put<Book>(url, book)
      .pipe(
        tap(updatedBook => {
          console.log('BookService: Updated book:', updatedBook);
          const currentBooksResponse = this.booksSubject.getValue();
          if (currentBooksResponse && Array.isArray(currentBooksResponse.items)) {
            const updatedItems = currentBooksResponse.items.map((b: Book) => b.bookId === book.bookId ? updatedBook : b);
            this.booksSubject.next({
              ...currentBooksResponse,
              items: updatedItems
            });
          }
        })
      );
  }

  // Delete a book
  deleteBook(id: string): Observable<void> {
    const url = `${this.API_URL}/books/${id}`;
    console.log('BookService: Making DELETE request to:', url);
    
    return this.http.delete<void>(url)
      .pipe(
        tap(() => {
          console.log('BookService: Deleted book with ID:', id);
          const currentBooksResponse = this.booksSubject.getValue();
          if (currentBooksResponse && Array.isArray(currentBooksResponse.items)) {
            const updatedItems = currentBooksResponse.items.filter((b: Book) => b.bookId !== id);
            this.booksSubject.next({
              ...currentBooksResponse,
              items: updatedItems,
              total: currentBooksResponse.total - 1
            });
          }
        })
      );
  }

  // Get all genres
  getGenres(): Observable<Genre[]> {
    const url = `${this.API_URL}/genres`;
    console.log('BookService: Making GET request to:', url);
    
    return this.http.get<Genre[]>(url)
      .pipe(
        tap(genres => {
          console.log('BookService: Received genres:', genres);
          this.genresSubject.next(genres);
        })
      );
  }

  // Get all authors
  getAuthors(): Observable<Author[]> {
    const url = `${this.API_URL}/authors`;
    console.log('BookService: Making GET request to:', url);

    return this.http.get<Author[]>(url)
      .pipe(
        tap(authors => {
          console.log('BookService: Received authors:', authors);
          this.authorsSubject.next(authors);
        })
      );
  }
}
