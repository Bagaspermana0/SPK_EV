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
        if not data:
            return jsonify({'success': False, 'error': 'Data JSON tidak boleh kosong'}), 400
            
        weights = data.get('weights')
        
        required_keys = {'price', 'range', 'top_speed', 'battery'}
        if not weights or set(weights.keys()) != required_keys:
            return jsonify({
                'success': False,
                'error': 'Bobot kriteria tidak valid. Harus mengandung kriteria: price, range, top_speed, battery.'
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
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'error': str(ve)
        }), 400
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
        if not data:
            return jsonify({'success': False, 'error': 'Data JSON tidak boleh kosong'}), 400
            
        scenarios = data.get('scenarios', [])
        
        vehicles = Vehicle.query.all()
        if not vehicles:
            return jsonify({
                'success': False,
                'error': 'No vehicles in database'
            }), 404
        vehicles_data = [v.to_dict() for v in vehicles]
        
        required_keys = {'price', 'range', 'top_speed', 'battery'}
        results = {}
        for i, scenario in enumerate(scenarios):
            w = scenario.get('weights')
            if not w or set(w.keys()) != required_keys:
                return jsonify({
                    'success': False,
                    'error': f"Skenario ke-{i+1} ('{scenario.get('name', 'Tanpa Nama')}') memiliki bobot kriteria tidak valid."
                }), 400
            
            weight_sum = sum(w.values())
            if abs(weight_sum - 1.0) > 0.01:
                return jsonify({
                    'success': False,
                    'error': f"Jumlah bobot skenario '{scenario.get('name')}' harus = 1.0, tapi = {weight_sum:.4f}"
                }), 400
                
            saw = SAWEngine(vehicles_data, w)
            result = saw.compute()
            results[scenario['name']] = result['top_10']
        
        return jsonify({
            'success': True,
            'scenarios': results
        }), 200
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'error': str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

