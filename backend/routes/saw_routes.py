from flask import Blueprint, request, jsonify
from models import db, Vehicle
from services.saw_engine import SAWEngine

saw_bp = Blueprint('saw', __name__, url_prefix='/api/saw')

@saw_bp.route('/rank', methods=['POST', 'OPTIONS'])
def rank_vehicles():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        weights = data.get('weights')
        
        if not weights or len(weights) != 4:
            return jsonify({
                'success': False,
                'error': 'Weights harus 4 kriteria'
            }), 400
        
        weight_sum = sum(weights.values())
        if abs(weight_sum - 1.0) > 0.01:
            return jsonify({
                'success': False,
                'error': f'Jumlah bobot harus = 1.0, tapi = {weight_sum:.4f}'
            }), 400
        
        vehicles = Vehicle.query.all()
        if not vehicles:
            return jsonify({
                'success': False,
                'error': 'No vehicles in database'
            }), 404
        
        vehicles_data = [v.to_dict() for v in vehicles]
        
        saw = SAWEngine(vehicles_data, weights)
        result = saw.compute()
        
        return jsonify({
            'success': True,
            'top_10': result['top_10'],
            'statistics': result['statistics'],
            'total_vehicles': result['statistics']['total']
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@saw_bp.route('/sensitivity', methods=['POST', 'OPTIONS'])
def sensitivity_analysis():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        scenarios = data.get('scenarios', [])
        
        vehicles = Vehicle.query.all()
        vehicles_data = [v.to_dict() for v in vehicles]
        
        results = {}
        for scenario in scenarios:
            saw = SAWEngine(vehicles_data, scenario['weights'])
            result = saw.compute()
            results[scenario['name']] = result['top_10']
        
        return jsonify({
            'success': True,
            'scenarios': results
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

