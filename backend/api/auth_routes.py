"""
Authentication Routes

Handles user registration, login, logout, and session management.
Uses Flask-Login for session-based authentication (cookies) rather than tokens.
All passwords are hashed before storage for security.
"""

from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User

# Create a Blueprint to organize authentication routes
# This keeps auth logic separate from other API routes
auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user account.
    """
    # Extract data from the JSON request body
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Validate that both fields are provided
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    # Check if username is already taken (querying the User table)
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    # Hash the password using Werkzeug's secure hashing (pbkdf2 by default)
    hashed_password = generate_password_hash(password)
    
    # Create new user object with hashed password
    new_user = User(username=username, password=hashed_password)
    
    # Add to database session and commit the transaction
    db.session.add(new_user)
    db.session.commit()

    # Return success response with 201 Created status
    return jsonify({'message': 'User registered successfully'}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate a user and create a session.
    """
    # Extract credentials from request
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Look up user by username
    user = User.query.filter_by(username=username).first()
    
    # Verify user exists and password matches the stored hash
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Create a session for this user using Flask-Login
    # This sets a session cookie in the response that identifies the user
    # The cookie is automatically sent with future requests
    login_user(user)
    
    # Return user info (but never the password hash)
    return jsonify({'user': {'id': user.id, 'username': user.username}}), 200


@auth_bp.route('/logout', methods=['POST'])
@login_required  # Decorator ensures only logged-in users can access this
def logout():
    """
    End the user's session.
    """
    # Clears the session cookie, effectively logging the user out
    logout_user()
    return jsonify({'message': 'Logged out'}), 200


@auth_bp.route('/me', methods=['GET'])
@login_required  # Protected route - must be logged in
def get_current_user():
    """
    Get information about the currently logged-in user.
    
    Used by the frontend to check if a session is still valid.
    Also provides user info when the page is refreshed.
    """
    # current_user is automatically set by Flask-Login based on the session cookie
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username
        }
    }), 200


"""
How Authentication Flow Works:

1. Registration:
   Frontend sends POST /api/register with username and password
   → Password is hashed
   → New user created in database
   → Frontend redirects to login page

2. Login:
   Frontend sends POST /api/login with credentials
   → User looked up by username
   → Password verified against hash
   → Session cookie created and sent to browser
   → Frontend receives user info and stores it in state

3. Logout:
   Frontend sends POST /api/logout
   → Session cookie is invalidated
   → current_user becomes anonymous
   → Frontend clears user state
"""