from flask import Blueprint, jsonify, request
from models import db, Vehicle
from sqlalchemy import func

vehicle_bp = Blueprint('vehicle', __name__, url_prefix='/api/vehicles')

@vehicle_bp.route('', methods=['GET', 'OPTIONS'])
def get_all_vehicles():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        vehicles = Vehicle.query.all()
        data = [v.to_dict() for v in vehicles]
        return jsonify({
            'success': True,
            'count': len(data),
            'vehicles': data
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@vehicle_bp.route('/stats', methods=['GET', 'OPTIONS'])
def vehicle_stats():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        stats = {
            'total': Vehicle.query.count(),
            'price': {
                'min': db.session.query(func.min(Vehicle.price)).scalar(),
                'max': db.session.query(func.max(Vehicle.price)).scalar(),
                'avg': db.session.query(func.avg(Vehicle.price)).scalar()
            },
            'range': {
                'min': db.session.query(func.min(Vehicle.range)).scalar(),
                'max': db.session.query(func.max(Vehicle.range)).scalar(),
                'avg': db.session.query(func.avg(Vehicle.range)).scalar()
            },
            'top_speed': {
                'min': db.session.query(func.min(Vehicle.top_speed)).scalar(),
                'max': db.session.query(func.max(Vehicle.top_speed)).scalar(),
                'avg': db.session.query(func.avg(Vehicle.top_speed)).scalar()
            },
            'battery': {
                'min': db.session.query(func.min(Vehicle.battery)).scalar(),
                'max': db.session.query(func.max(Vehicle.battery)).scalar(),
                'avg': db.session.query(func.avg(Vehicle.battery)).scalar()
            }
        }
        
        return jsonify({
            'success': True,
            'statistics': stats
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
