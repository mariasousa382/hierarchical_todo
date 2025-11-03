"""
Task Routes
"""

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from extensions import db
from models import Task, TodoList

# Create a Blueprint for task-related routes
task_bp = Blueprint('task_bp', __name__)


def build_task_tree(tasks):
    """
    Convert a flat list of tasks into a nested tree structure.
    
    This function takes all tasks from a list (regardless of nesting level)
    and organizes them into a parent-child hierarchy based on parent_id.
    The frontend receives this nested structure and can render it recursively.
    """
    # First pass: create a dictionary of all tasks with their basic data
    # Each task gets a 'subtasks' array that will be populated next
    task_map = {t.id: {
        'id': t.id,
        'content': t.content,
        'completed': t.completed,
        'collapsed': t.collapsed,  # UI state for showing/hiding children
        'parent_id': t.parent_id,
        'list_id': t.list_id,
        'subtasks': []  # Will hold child tasks
    } for t in tasks}

    # Second pass: build the tree structure
    # Tasks with parent_id get added to their parent's subtasks array
    # Tasks without parent_id become root-level tasks
    root_tasks = []
    for t in tasks:
        if t.parent_id:
            # This is a subtask - find its parent and add it there
            parent = task_map.get(t.parent_id)
            if parent:
                parent['subtasks'].append(task_map[t.id])
        else:
            # This is a top-level task - add it to the root array
            root_tasks.append(task_map[t.id])
    
    return root_tasks


@task_bp.route('/lists/<int:list_id>/tasks', methods=['GET'])
@login_required
def get_tasks(list_id):
    """
    Get all tasks for a specific list, organized as a tree.
    Used by the frontend to display the tasks page.
    """
    # Security check: verify this list belongs to the current user
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()
    
    # Get ALL tasks in this list (including nested subtasks)
    tasks = Task.query.filter_by(list_id=todo_list.id).all()
    
    # Convert flat list to nested tree structure for the frontend
    return jsonify(build_task_tree(tasks))


@task_bp.route('/lists/<int:list_id>/tasks', methods=['POST'])
@login_required
def create_task(list_id):
    """
    Create a new task or subtask in a list.
    """
    # Security check: verify list ownership
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()
    
    data = request.get_json()
    
    # parent_id can be None (top-level task) or an integer (subtask)
    parent_id = data.get('parent_id')
    
    # Create the new task
    new_task = Task(
        content=data['content'],
        list_id=todo_list.id,
        parent_id=parent_id  # None for top-level, or parent task ID for subtask
    )

    db.session.add(new_task)
    db.session.commit()
    
    # Return the created task info
    return jsonify({
        'id': new_task.id,
        'content': new_task.content,
        'parent_id': new_task.parent_id
    })


@task_bp.route('/tasks/<int:task_id>', methods=['PATCH'])
@login_required
def update_task(task_id):
    """
    Update a task's properties.
    
    Supports multiple update operations:
    - Mark complete/incomplete (cascades to all subtasks)
    - Toggle collapse state (UI only, for showing/hiding subtasks)
    - Edit content (rename the task)
    - Move to another list (only top-level tasks, cascades to subtasks)
    """
    # Find the task
    task = Task.query.get_or_404(task_id)

    # Security check: verify this task's list belongs to the current user
    todo_list = TodoList.query.get(task.list_id)
    if not todo_list or todo_list.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    # Update completion status
    if 'completed' in data:
        task.completed = data['completed']

        # Cascade completion to all subtasks recursively
        def cascade_complete(t, value):
            for sub in t.subtasks:
                sub.completed = value
                cascade_complete(sub, value)  # Recursive call for nested subtasks

        cascade_complete(task, data["completed"])

    # Toggle collapse state (UI preference for showing/hiding subtasks)
    if 'collapsed' in data:
        task.collapsed = data['collapsed']

    # Edit the task content (rename)
    if 'content' in data:
        task.content = data['content']
    
    # Move task to another list
    # Only top-level tasks can be moved (subtasks stay with their parent)
    if 'list_id' in data:
        new_list_id = data['list_id']
        task.list_id = new_list_id

        # Recursively update all subtasks to match the new list (they move together)
        def cascade_move(t, new_list_id):
            for sub in t.subtasks:
                sub.list_id = new_list_id
                cascade_move(sub, new_list_id)  # Recursive for nested subtasks

        cascade_move(task, new_list_id)

    # Save all changes to the database
    db.session.commit()

    # Return the updated task data
    return jsonify({
        'id': task.id,
        'content': task.content,
        'completed': task.completed,
        'collapsed': task.collapsed,
        'parent_id': task.parent_id,
        'list_id': task.list_id
    })


@task_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    """
    Delete a task and all its subtasks.
    """
    # Find the task
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    if task.todo_list.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Delete the task and cascade delete
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted successfully'})


