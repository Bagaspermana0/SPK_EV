import numpy as np

class AHPEngine:
    RI = {1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45}
    
    def __init__(self, pairwise_matrix):
        self.A = np.array(pairwise_matrix, dtype=float)
        self.n = 4
        
        if self.A.shape != (4, 4):
            raise ValueError("Matrix harus 4x4")
        
        for i in range(4):
            if abs(self.A[i][i] - 1.0) > 0.001:
                self.A[i][i] = 1.0
    
    def _normalize_matrix(self):
        col_sums = np.sum(self.A, axis=0)
        self.A_norm = self.A / col_sums
        return self.A_norm
    
    def _calculate_weights(self):
        self.weights = np.mean(self.A_norm, axis=1)
        return self.weights
    
    def _calculate_lambda_max(self):
        Aw = self.A @ self.weights
        self.lambda_max = np.sum(Aw / self.weights) / self.n
        return self.lambda_max
    
    def _calculate_ci(self):
        self.ci = (self.lambda_max - self.n) / (self.n - 1)
        return self.ci
    
    def _calculate_cr(self):
        ri = self.RI[self.n]
        self.cr = self.ci / ri if ri > 0 else 0.0
        return self.cr
    
    def is_consistent(self):
        return self.cr <= 0.10
    
    def compute(self):
        self._normalize_matrix()
        self._calculate_weights()
        self._calculate_lambda_max()
        self._calculate_ci()
        self._calculate_cr()
        
        return {
            'weights': {
                'price': float(self.weights[0]),
                'range': float(self.weights[1]),
                'top_speed': float(self.weights[2]),
                'battery': float(self.weights[3])
            },
            'lambda_max': float(self.lambda_max),
            'ci': float(self.ci),
            'cr': float(self.cr),
            'is_consistent': self.is_consistent()
        }
