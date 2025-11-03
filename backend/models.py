"""
Database Models 

This file defines the database schema using SQLAlchemy ORM.
It contains three tables: User, TodoList, and Task.
"""

from extensions import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash


class User(UserMixin, db.Model):
    """
    Represents an application user. Each user can own multiple
    todo lists. Passwords are securely stored as hashed strings.
    The User model stores credentials and account data for each user and
    inherits from Flask-Login's UserMixin to easily manage sessions.
    """
    
    # Primary identifier for each user
    id = db.Column(db.Integer, primary_key=True)
    
    # Username must be unique 
    username = db.Column(db.String(80), unique=True, nullable=False)
    
    # Password is stored as a hash for security, 200 chars to accommodate hash length
    password = db.Column(db.String(200), nullable=False)
    
    # Relationship: One user has many lists
    # Cascade delete ensures that when a user is deleted, all their lists (and associated tasks) are also deleted.
    lists = db.relationship('TodoList', backref='user', lazy=True, cascade='all, delete-orphan')

    def check_password(self, password):
        """
        Verify a password against the stored hash.
        """
        return check_password_hash(self.password, password)


class TodoList(db.Model):
    """
    Represents a named list owned by a specific user.
    Each list can contain multiple tasks (including subtasks).
    Thus, each TodoList belongs to one User and contains multiple Tasks.
    """
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    
    # Foreign key establishes ownership - each list belongs to one user
    # This ensures data isolation between users
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationship: One list has many tasks
    # Cascade ensures tasks are removed if their parent list is deleted.
    tasks = db.relationship('Task', backref='todo_list', lazy=True, cascade='all, delete-orphan')


class Task(db.Model):
    """    
    Tasks can have subtasks (children) and belong to a parent task, creating a tree structure.
    This allows unlimited nesting depth.
    Each task may belong to a parent task (subtask relationship).
    Each task also belongs to a specific TodoList.
    """
    
    id = db.Column(db.Integer, primary_key=True)
    
    # actual task description (what needs to be done)
    content = db.Column(db.String(500), nullable=False)
    
    # Tracks whether the task has been finished, default False means new tasks start incomplete
    completed = db.Column(db.Boolean, default=False)
    
    # UI state: whether subtasks are hidden or shown, default False means subtasks are visible by default
    collapsed = db.Column(db.Boolean, default=False)
    
    # Foreign key: every task belongs to a list
    list_id = db.Column(db.Integer, db.ForeignKey('todo_list.id'), nullable=False)
    
    # Self-referencing foreign key: creates the hierarchical structure
    # nullable=True because top-level tasks don't have a parent
    # If parent_id is None, this is a root-level task
    # If parent_id has a value, this is a subtask of that task
    parent_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    
    # Relationship: One task can have many subtasks (children)
    # This is a self-referential relationship (Task -> Task)
    # "remote_side=[id]" tells SQLAlchemy how to link child → parent.
    # Cascade ensures that deleting a parent task also deletes all subtasks.
    subtasks = db.relationship(
        'Task',
        backref=db.backref('parent', remote_side=[id]),
        lazy=True,
        cascade='all, delete-orphan'
    )


"""
This design allows:
- User isolation (users can't see each other's data)
- Unlimited task nesting (tree structure)
- Easy cleanup (cascading deletes)
- Efficient queries (foreign keys are indexed)
"""
