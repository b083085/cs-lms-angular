# Dashboard API Integration Guide

## Overview
The Dashboard Service provides comprehensive functionality for managing dashboard data, user information, role management, and notifications in the Library Management System.

## API Endpoints

### 1. Get Dashboard Data
- **URL**: `GET /api/v1/dashboard`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response** (200):
```json
{
  "user": {
    "userId": "user123",
    "userName": "johndoe",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "gender": "M",
    "role": "member"
  },
  "stats": {
    "totalBooks": 1500,
    "borrowedBooks": 3,
    "availableBooks": 1497,
    "overdueBooks": 1
  },
  "recentActivities": [
    {
      "id": "act1",
      "type": "borrow",
      "bookTitle": "Angular Development Guide",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "completed"
    }
  ],
  "notifications": [
    {
      "id": "notif1",
      "type": "warning",
      "title": "Overdue Book",
      "message": "Your book 'React Patterns' is overdue",
      "timestamp": "2024-01-15T09:00:00Z",
      "isRead": false
    }
  ]
}
```

### 2. Mark Notification as Read
- **URL**: `PATCH /api/v1/dashboard/notifications/{notificationId}/read`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response** (200): Empty response body

### 3. Mark All Notifications as Read
- **URL**: `PATCH /api/v1/dashboard/notifications/mark-all-read`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response** (200): Empty response body

### 4. Request Role Change
- **URL**: `POST /api/v1/dashboard/role-request`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Request Body**:
```json
{
  "userId": "user123",
  "role": "librarian",
  "requestedAt": "2024-01-15T10:30:00Z",
  "status": "pending"
}
```
- **Response** (201):
```json
{
  "id": "req1",
  "userId": "user123",
  "role": "librarian",
  "requestedAt": "2024-01-15T10:30:00Z",
  "status": "pending"
}
```

### 5. Get User Role Requests (Admin Only)
- **URL**: `GET /api/v1/dashboard/role-requests`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response** (200):
```json
[
  {
    "id": "req1",
    "userId": "user123",
    "role": "librarian",
    "requestedAt": "2024-01-15T10:30:00Z",
    "status": "pending"
  }
]
```

### 6. Approve Role Request (Admin Only)
- **URL**: `PATCH /api/v1/dashboard/role-requests/{requestId}/approve`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response** (200): Empty response body

### 7. Reject Role Request (Admin Only)
- **URL**: `PATCH /api/v1/dashboard/role-requests/{requestId}/reject`
- **Headers**: `Authorization: Bearer {accessToken}`
- **Response** (200): Empty response body

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Dashboard Service Features

### Core Functionality
- **Dashboard Data Loading**: Fetches comprehensive dashboard data including user info, stats, activities, and notifications
- **User Information**: Provides easy access to current user ID, role, and profile information
- **Role Management**: Includes role checking methods and role change request functionality
- **Notification Management**: Handles notification reading and management
- **Activity Tracking**: Displays recent user activities

### User Role Methods
- `getUserId()`: Returns current user ID
- `getUserRole()`: Returns current user role
- `hasRole(role)`: Checks if user has specific role
- `isAdmin()`: Checks if user is admin
- `isLibrarian()`: Checks if user is librarian
- `isMember()`: Checks if user is member

### Data Management
- **Reactive Data**: Uses BehaviorSubject for reactive data updates
- **Caching**: Stores dashboard data locally for performance
- **Refresh**: Provides methods to refresh dashboard data
- **Cleanup**: Clears data on logout

### Error Handling
- **Authentication Errors**: Handles 401 responses with automatic logout
- **Authorization Errors**: Handles 403 responses with appropriate messaging
- **Network Errors**: Handles connection issues gracefully
- **Server Errors**: Provides fallback error messages

## Usage Example

```typescript
// In a component
constructor(private dashboardService: DashboardService) {}

ngOnInit() {
  // Load dashboard data
  this.dashboardService.getDashboardData().subscribe({
    next: (data) => {
      console.log('Dashboard loaded:', data);
    },
    error: (error) => {
      console.error('Dashboard error:', error);
    }
  });

  // Check user role
  if (this.dashboardService.isAdmin()) {
    console.log('User is admin');
  }

  // Get user ID
  const userId = this.dashboardService.getUserId();
  console.log('User ID:', userId);
}
```

## Integration Notes
- The service automatically includes Bearer token authentication via the HTTP interceptor
- All API calls are made to the configured environment API URL
- The service integrates seamlessly with the AuthService for user session management
- Dashboard data is cached and can be accessed synchronously after initial load
