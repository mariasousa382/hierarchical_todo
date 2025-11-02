from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.security import check_password_hash, generate_password_hash
from models import User, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username taken'}), 400
    
    user = User(username=username)
    user.password = generate_password_hash(password)
    db.session.add(user)
    db.session.commit()
    
    login_user(user, remember=True)  # ✅ Auto-login after register
    return jsonify({
        'message': 'Registered successfully',
        'user': {'id': user.id, 'username': user.username}
    })

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    login_user(user, remember=True)  # ✅ remember=True keeps session alive
    return jsonify({
        'message': 'Login successful',
        'user': {'id': user.id, 'username': user.username}
    })

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'})

@auth_bp.route('/current_user', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username
    })