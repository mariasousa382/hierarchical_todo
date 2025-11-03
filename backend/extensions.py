"""
Flask Extensions Module

This file initializes Flask extensions that need to be shared across the application.
This was created during debugging.By creating extensions here (instead of in app.py), we avoid circular import issues.
"""

from flask_sqlalchemy import SQLAlchemy
# Initialize SQLAlchemy ORM
db = SQLAlchemy()
