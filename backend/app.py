from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from routes.ahp_routes import ahp_bp
from routes.saw_routes import saw_bp
from routes.vehicle_routes import vehicle_bp
import os

def create_app():
    app = Flask(__name__)
    
    # Config
    app.config.from_object(Config)

    
    # Init DB
    db.init_app(app)
    
    # CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "OPTIONS"]
        }
    })
    
    # Blueprints
    app.register_blueprint(ahp_bp)
    app.register_blueprint(saw_bp)
    app.register_blueprint(vehicle_bp)
    
    # Health check
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'timestamp': str(__import__('datetime').datetime.now())}), 200
    
    return app

app = create_app()

if __name__ == '__main__':
    if os.getenv('INIT_DB_ON_STARTUP', '').lower() in {'1', 'true', 'yes'}:
        try:
            with app.app_context():
                db.create_all()
        except Exception as exc:
            print(f"Database init skipped: {exc}")
    print("Flask app running on http://0.0.0.0:5000")
    print("API ready at http://127.0.0.1:5000/api/health")
    app.run(debug=True, host='0.0.0.0', port=5000)
