from flask import Blueprint, jsonify, request
from extensions import db
from models import TodoList
from flask_login import login_required, current_user

list_bp = Blueprint('list_bp', __name__)

# Get all lists for the logged-in user
@list_bp.route('/lists', methods=['GET'])
@login_required
def get_lists():
    lists = TodoList.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'id': l.id, 'name': l.name, 'user_id': l.user_id} for l in lists])

# Create a new todo list
@list_bp.route('/lists', methods=['POST'])
@login_required
def create_list():
    data = request.get_json()
    new_list = TodoList(name=data['name'], user_id=current_user.id)
    db.session.add(new_list)
    db.session.commit()
    return jsonify({'id': new_list.id, 'name': new_list.name})

# Delete a todo list
@list_bp.route('/lists/<int:list_id>', methods=['DELETE'])
@login_required
def delete_list(list_id):
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()

    # delete all related tasks first
    for task in todo_list.tasks:
        db.session.delete(task)
    db.session.delete(todo_list)
    db.session.commit()

    return jsonify({"message": "List deleted successfully"})
