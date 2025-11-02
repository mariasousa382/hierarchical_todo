from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from extensions import db

app = Flask(__name__)
app.config.update(
    SECRET_KEY="secret123",  # ✅ Keep consistent across restarts
    SQLALCHEMY_DATABASE_URI="sqlite:///todo.db",
    SESSION_COOKIE_SAMESITE="Lax",   # ✅ Changed from "None" for local dev
    SESSION_COOKIE_SECURE=False,      # ✅ False for http://localhost
    SESSION_COOKIE_HTTPONLY=True,     # ✅ Add this for security
    PERMANENT_SESSION_LIFETIME=86400, # ✅ 24 hours
)

# ✅ CORS must allow credentials and specify exact origin
CORS(app, 
     supports_credentials=True, 
     origins=['http://localhost:3000'],
     allow_headers=['Content-Type'],
     expose_headers=['Set-Cookie'])

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)

from models import User, TodoList, Task

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

from api.list_routes import list_bp
from api.task_routes import task_bp
from api.auth_routes import auth_bp 

app.register_blueprint(list_bp, url_prefix='/api')
app.register_blueprint(task_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')

@app.route('/')
def index():
    return {'message': 'Backend running!'}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)