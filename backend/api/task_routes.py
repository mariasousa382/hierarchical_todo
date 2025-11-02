from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from extensions import db
from models import Task, TodoList

task_bp = Blueprint('task_bp', __name__)

def build_task_tree(tasks):
    """Recursively build nested JSON structure for tasks."""
    task_map = {t.id: {
        'id': t.id,
        'content': t.content,
        'completed': t.completed,
        'collapsed': t.collapsed,
        'parent_id': t.parent_id,
        'subtasks': []
    } for t in tasks}

    # Assign children to parents
    root_tasks = []
    for t in tasks:
        if t.parent_id:
            parent = task_map.get(t.parent_id)
            if parent:
                parent['subtasks'].append(task_map[t.id])
        else:
            root_tasks.append(task_map[t.id])
    return root_tasks


# GET tasks in one list
@task_bp.route('/lists/<int:list_id>/tasks', methods=['GET'])
@login_required
def get_tasks(list_id):
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()
    tasks = Task.query.filter_by(list_id=todo_list.id).all()
    return jsonify(build_task_tree(tasks))

# POST create a new task (or subtask) 
@task_bp.route('/lists/<int:list_id>/tasks', methods=['POST'])
@login_required
def create_task(list_id):
    todo_list = TodoList.query.filter_by(id=list_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    # Accept optional parent_id
    parent_id = data.get('parent_id')
    new_task = Task(
        content=data['content'],
        list_id=todo_list.id,
        parent_id=parent_id  # can be None for top-level tasks
    )

    db.session.add(new_task)
    db.session.commit()
    return jsonify({'id': new_task.id,'content': new_task.content,'parent_id': new_task.parent_id})

# PATCH mark complete, toggle collapse, or update text 
@task_bp.route('/tasks/<int:task_id>', methods=['PATCH'])
@login_required
def update_task(task_id):
    task = Task.query.get_or_404(task_id)

    # Security: make sure this task belongs to the logged-in user
    todo_list = TodoList.query.get(task.list_id)
    if not todo_list or todo_list.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()

    # Toggle completion
    if 'completed' in data:
        task.completed = data['completed']

        # Cascade completion to all subtasks
        def cascade_complete(t, value):
            for sub in t.subtasks:
                sub.completed = value
                cascade_complete(sub, value)

        cascade_complete(task, data["completed"])

    # Toggle collapse (for hiding/showing subtasks)
    if 'collapsed' in data:
        task.collapsed = data['collapsed']

    # Edit content
    if 'content' in data:
        task.content = data['content']
    
    # Move task to another list (only top-level tasks)
    if 'list_id' in data:
        new_list_id = data['list_id']
        task.list_id = new_list_id

        # recursively update all subtasks to match
        def cascade_move(t, new_list_id):
            for sub in t.subtasks:
                sub.list_id = new_list_id
                cascade_move(sub, new_list_id)

        cascade_move(task, new_list_id)

    db.session.commit()

    return jsonify({
        'id': task.id,
        'content': task.content,
        'completed': task.completed,
        'collapsed': task.collapsed,
        'parent_id': task.parent_id
    })

# DELETE task
@task_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    if task.todo_list.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'})
