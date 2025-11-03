"""
Main Flask Application Entry Point

This file initializes and configures the Flask application.
It sets up:
- Database connection (SQLAlchemy)
- User authentication (Flask-Login)
- API routes (blueprints)
- Static file serving for React frontend
- CORS for cross-origin requests
"""

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_login import LoginManager
from extensions import db
from models import User
import os

# Initialize Flask app
# static_folder points to the React production build
app = Flask(__name__, static_folder='../frontend/build', static_url_path='')

# Application Configuration
app.config.update(
    SECRET_KEY="secret123",
    
    # sqlite:/// creates a file-based database in instance/todo.db
    SQLALCHEMY_DATABASE_URI="sqlite:///todo.db",
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_HTTPONLY=True,
    
    # Session expires after 24 hours (86400 seconds)
    PERMANENT_SESSION_LIFETIME=86400,
)

# Allows the frontend to make requests to the backend
CORS(app, 
     supports_credentials=True,  # Allow session cookies to be sent
     origins=['http://localhost:3000'],  # Only allow requests from React dev server
     allow_headers=['Content-Type'],  # Accept JSON requests
     expose_headers=['Set-Cookie'])  # Allow frontend to read Set-Cookie header

# Initialize SQLAlchemy with the Flask app
db.init_app(app)

# Initialize Flask-Login for session management
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    """
    Flask-Login callback to reload the user from the session.
    """
    return User.query.get(int(user_id))


# Register API Route Blueprints
# Blueprints organize routes into modules (auth, lists, tasks)
from api.auth_routes import auth_bp
from api.list_routes import list_bp
from api.task_routes import task_bp

# auth_bp: /api/register, /api/login, /api/logout, /api/me
# list_bp: /api/lists, /api/lists/<id>
# task_bp: /api/lists/<id>/tasks, /api/tasks/<id>
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(list_bp, url_prefix='/api')
app.register_blueprint(task_bp, url_prefix='/api')


# React Frontend Serving
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """
    Catch-all route that serves the React frontend.
    """
    # Check if the requested path is an actual file in the build folder
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        # React Router will look at the URL and show the appropriate component
        return send_from_directory(app.static_folder, 'index.html')


# Database Initialization
with app.app_context():
    """
    Create all database tables based on the models.    
    """
    db.create_all()


# Application Entry Point
if __name__ == '__main__':
    """
    Run the Flask development server.
    
    port=5000 runs the server on http://localhost:5000
    debug=True enables auto-reload and debug mode.
    """
    app.run(debug=True, port=5000)