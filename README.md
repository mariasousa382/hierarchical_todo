# Hierarchical Todo App

A full-stack web application for managing todo lists with hierarchical task organization. Built with Flask backend and React frontend.


## Screen Recording Link: https://www.loom.com/share/43e8a43a2b6f432dad3ef60728a5643f 

## Features

- **User Authentication**: Secure login and registration with password hashing
- **Multiple Lists**: Create and manage multiple todo lists per user
- **Hierarchical Tasks**: Organize tasks with unlimited nesting of subtasks
- **Task Management**: Add, edit, delete, and move (top-level) tasks between lists
- **Task Completion**: Mark tasks as complete with visual indicators
- **Collapsible Subtasks**: Expand/collapse task hierarchies for better organization
- **List Management**: Create, rename, and delete todo lists

## Installation

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### Setup Instructions

Navigate to the backend directory:
```bash
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 app.py
```
Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

1. **Registration**: Create a new account on the registration page
2. **Login**: Sign in with your credentials
3. **Create Lists**: Add new todo lists from the main page
4. **Manage Tasks**: 
   - Click on a list to view and manage its tasks
   - Add new tasks using the input form
   - Click "Subtask" to add nested subtasks
   - Check boxes to mark tasks complete
   - Use "Edit" to rename tasks
   - Use "Delete" to remove tasks
   - Use "Move" to relocate top-level tasks to other lists
5. **Navigate**: Use "Back to Lists" to return to the lists overview

## Project Structure

```
hierarchical_todo/
├── README.md                 # This file
├── backend/                  # Flask backend server
│   ├── app.py                # Main Flask application
│   ├── delete_users.py       # Utility script for deleting users
│   ├── extensions.py         # Flask extensions initialization
│   ├── models.py             # Database models
│   ├── requirements.txt      # Python dependencies
│   ├── api/                  # API endpoints
│   │   ├── auth_routes.py    # Authentication routes
│   │   ├── list_routes.py    # List management routes
│   │   └── task_routes.py    # Task management routes
│   └── instance/             # Local database storage
│       └── todo.db           # SQLite database file
└── frontend/
    ├── package.json          # Frontend dependencies and scripts
    ├── package-lock.json     # Locked dependency versions
    ├── public/
    │   └── index.html        # Main HTML template
    └── src/
        ├── App.js            # Main React component and routing
        ├── index.js          # React entry point
        ├── index.css         # Global styles
        ├── components/       # Reusable UI components
        │   ├── Navbar.js     # Navigation bar component
        │   ├── Navbar.css    # Navigation bar styles
        │   ├── TaskItem.js   # Individual task component
        │   └── TaskItem.css  # Task item styles
        └── pages/            # Page-level components
            ├── LoginPage.js  # Login page
            ├── RegisterPage.js # Registration page
            ├── ListsPage.js  # Todo lists overview
            └── TasksPage.js  # Tasks view for a list
```

## Technologies Used

### Backend
- **Flask 2.2.5**: Python web framework
- **Flask-SQLAlchemy 3.0.5**: ORM for database operations
- **Flask-Login 0.6.2**: User session management
- **Flask-CORS 4.0.0**: Cross-origin resource sharing
- **Werkzeug 2.2.2**: WSGI utilities and password hashing
- **SQLite**: Lightweight database

### Frontend
- **React 18**: JavaScript UI library
- **React Router 6**: Client-side routing
- **CSS3**: Styling with custom variables

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user

### Lists
- `GET /api/lists` - Get all lists for user
- `GET /api/lists/<id>` - Get specific list
- `POST /api/lists` - Create new list
- `PATCH /api/lists/<id>` - Update list name
- `DELETE /api/lists/<id>` - Delete list

### Tasks
- `GET /api/lists/<id>/tasks` - Get all tasks in list
- `POST /api/lists/<id>/tasks` - Create new task
- `PATCH /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task

## Database Schema

### User
- `id` (Integer, Primary Key)
- `username` (String, Unique)
- `password` (String, Hashed)

### TodoList
- `id` (Integer, Primary Key)
- `name` (String)
- `user_id` (Foreign Key → User)

### Task
- `id` (Integer, Primary Key)
- `content` (String)
- `completed` (Boolean)
- `collapsed` (Boolean)
- `list_id` (Foreign Key → TodoList)
- `parent_id` (Foreign Key → Task, Self-referencing)

## Security Features

- Password hashing using Werkzeug's security utilities
- Session-based authentication with Flask-Login
- Secure password storage (never stored in plain text)
- User isolation (users can only access their own data)

## License

This project was created as a class assignment for CS162.