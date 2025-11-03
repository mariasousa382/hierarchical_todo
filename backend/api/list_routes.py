"""
Todo List Routes
"""

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from extensions import db
from models import TodoList

# Create a Blueprint for list-related routes
# Keeps list management separate from auth and task routes
list_bp = Blueprint('list_bp', __name__)


@list_bp.route('/lists', methods=['GET'])
@login_required  # User must be logged in to access this
def get_lists():
    """
    Get all todo lists for the currently logged-in user.
    """
    # Query database for lists belonging to the current user
    # filter_by(user_id=current_user.id) ensures users can only see their own lists
    lists = TodoList.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'id': l.id, 'name': l.name} for l in lists])


@list_bp.route('/lists/<int:list_id>', methods=['GET'])
@login_required
def get_list(list_id):
    """
    Get a specific todo list by ID.
    """
    # Query for list with matching ID AND owned by current user
    # first_or_404() returns the list or automatically sends a 404 error
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()
    
    return jsonify({'id': todo_list.id, 'name': todo_list.name})


@list_bp.route('/lists', methods=['POST'])
@login_required
def create_list():
    """
    Create a new todo list for the current user.
    """
    # Extract the list name from the request JSON
    data = request.get_json()
    
    # Create new TodoList object
    # user_id is automatically set to the logged-in user
    new_list = TodoList(name=data['name'], user_id=current_user.id)
    
    # Add to database session (stages the change)
    db.session.add(new_list)
    
    # Commit writes the change to the database
    db.session.commit()
    return jsonify({'id': new_list.id, 'name': new_list.name}), 201


@list_bp.route('/lists/<int:list_id>', methods=['PATCH'])
@login_required
def update_list(list_id):
    """
    Update an existing todo list (currently only supports renaming).
    PATCH is used instead of PUT because we're doing a partial update.
    """
    # Find the list and verify it belongs to the current user
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()
    
    # Get the update data from request
    data = request.get_json()
    
    # Only update the name if it's provided in the request
    # This allows for partial updates (could add more fields in the future)
    if 'name' in data:
        todo_list.name = data['name']
    
    # Save the changes to the database
    db.session.commit()
    
    # Return the updated list
    return jsonify({'id': todo_list.id, 'name': todo_list.name})


@list_bp.route('/lists/<int:list_id>', methods=['DELETE'])
@login_required
def delete_list(list_id):
    """
    Delete a todo list and all its tasks.
    """
    # Find the list and verify ownership
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()
    
    # Delete the list from the database and trigger cascade delete
    db.session.delete(todo_list)
    
    # Commit the deletion to the database
    db.session.commit()
    
    # Return success message with 200 OK status
    return jsonify({'message': 'List deleted'}), 200


"""
How List Operations Work in the Application Flow:

1. User logs in → Session established
   
2. Frontend requests GET /api/lists
   → Returns all lists for this user
   → Frontend displays them on the main page

3. User clicks "New List"
   → Frontend sends POST /api/lists with name
   → New list created in database
   → Frontend adds it to the displayed lists

4. User clicks on a list name (in edit mode)
   → Frontend sends PATCH /api/lists/<id> with new name
   → List name updated in database
   → Frontend updates the displayed name

5. User clicks "Delete" on a list
   → Frontend sends DELETE /api/lists/<id>
   → List and all its tasks removed from database
   → Frontend removes it from the display
"""
