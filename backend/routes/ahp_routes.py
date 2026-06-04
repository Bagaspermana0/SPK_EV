from flask import Blueprint, request, jsonify
from services.ahp_engine import AHPEngine

ahp_bp = Blueprint('ahp', __name__, url_prefix='/api/ahp')

@ahp_bp.route('/calculate', methods=['POST', 'OPTIONS'])
def calculate_ahp():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        matrix = data.get('pairwise_matrix')
        
        if not matrix:
            return jsonify({
                'success': False,
                'error': 'Missing pairwise_matrix'
            }), 400
        
        if len(matrix) != 4 or any(len(row) != 4 for row in matrix):
            return jsonify({
                'success': False,
                'error': 'Matrix harus 4x4'
            }), 400
        
        ahp = AHPEngine(matrix)
        result = ahp.compute()
        
        if not result['is_consistent']:
            return jsonify({
                'success': False,
                'error': 'Inconsistent',
                'cr': result['cr'],
                'message': f"CR = {result['cr']:.4f} > 0.10. Silakan revisi preferensi Anda."
            }), 422
        
        return jsonify({
            'success': True,
            'weights': result['weights'],
            'cr': result['cr'],
            'is_consistent': True
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
