import numpy as np
import pandas as pd

class AHPCalculator:
    """
    Analytical Hierarchy Process (AHP) Calculator
    Menghitung bobot kriteria berdasarkan perbandingan berpasangan
    """
    
    def __init__(self):
        # Indeks konsistensi random (RI) untuk skala Saaty
        self.ri_values = {
            1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 
            6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45
        }
    
    def normalize_matrix(self, matrix):
        """Normalisasi matriks dengan membagi setiap elemen dengan jumlah kolom"""
        col_sum = matrix.sum(axis=0)
        normalized = matrix / col_sum
        return normalized
    
    def calculate_weights(self, normalized_matrix):
        """Hitung bobot dengan merata-rata setiap baris"""
        weights = normalized_matrix.mean(axis=1)
        return weights
    
    def calculate_lambda_max(self, matrix, weights):
        """Hitung nilai eigen maksimum (λmax)"""
        consistency_vector = matrix.sum(axis=1) / weights
        lambda_max = consistency_vector.mean()
        return lambda_max
    
    def calculate_consistency_index(self, lambda_max, n):
        """Hitung Consistency Index (CI)"""
        ci = (lambda_max - n) / (n - 1)
        return ci
    
    def calculate_consistency_ratio(self, ci, n):
        """Hitung Consistency Ratio (CR)"""
        ri = self.ri_values.get(n, 0)
        if ri == 0:
            return 0
        cr = ci / ri
        return cr
    
    def validate_pairwise_matrix(self, matrix):
        """
        Validasi matriks perbandingan berpasangan
        - Diagonal harus 1
        - Simetri resiprokal: a_ij * a_ji = 1
        """
        n = matrix.shape[0]
        
        # Check diagonal
        if not np.allclose(np.diag(matrix), 1):
            return False, "Diagonal matriks harus semua 1"
        
        # Check reciprocal symmetry
        for i in range(n):
            for j in range(n):
                if not np.isclose(matrix[i, j] * matrix[j, i], 1):
                    return False, f"Matriks bukan resiprokal pada [{i},{j}]"
        
        return True, "Valid"
    
    def calculate(self, pairwise_matrix):
        """
        Hitung AHP lengkap
        Input: Pairwise comparison matrix (n x n)
        Output: weights, CR, lambda_max
        """
        n = pairwise_matrix.shape[0]
        
        # Validate
        is_valid, msg = self.validate_pairwise_matrix(pairwise_matrix)
        if not is_valid:
            return None, None, None, msg
        
        # Normalize
        normalized = self.normalize_matrix(pairwise_matrix)
        
        # Calculate weights
        weights = self.calculate_weights(normalized)
        
        # Calculate lambda max
        lambda_max = self.calculate_lambda_max(pairwise_matrix, weights)
        
        # Calculate CI
        ci = self.calculate_consistency_index(lambda_max, n)
        
        # Calculate CR
        cr = self.calculate_consistency_ratio(ci, n)
        
        return weights, cr, lambda_max, "Success"


class SimpleAHPFromWeights:
    """
    Versi simplified AHP yang langsung dari bobot (tidak perlu full matrix)
    Digunakan saat user sudah memberikan bobot langsung
    """
    
    def __init__(self, weights_dict):
        """
        weights_dict: {'price': 0.25, 'range': 0.25, 'top_speed': 0.25, 'battery': 0.25}
        """
        self.weights = weights_dict
        self.criteria = list(weights_dict.keys())
    
    def get_weights_vector(self):
        """Return weights sebagai vektor urut"""
        return np.array([self.weights[c] for c in self.criteria])
    
    def get_weights_dict(self):
        """Return weights sebagai dictionary"""
        return self.weights
