import pandas as pd
import numpy as np

class SAWEngine:
    
    def __init__(self, vehicles_data, weights):
        self.df = pd.DataFrame(vehicles_data)
        self.weights = weights
        
        self.cost_criteria = ['price']
        self.benefit_criteria = ['range', 'top_speed', 'battery']
    
    def normalize(self):
        self.normalized = pd.DataFrame()
        
        for col in ['price', 'range', 'top_speed', 'battery']:
            if col in self.cost_criteria:
                min_val = self.df[col].min()
                # Check for zero or negative values in cost criteria to prevent division by zero or invalid normalizations
                if (self.df[col] <= 0).any():
                    raise ValueError(f"Kriteria cost '{col}' mengandung nilai nol atau negatif, normalisasi SAW tidak dapat dihitung.")
                self.normalized[col] = min_val / self.df[col]
            else:
                max_val = self.df[col].max()
                # Check if max value of benefit criteria is zero or negative
                if max_val <= 0:
                    raise ValueError(f"Kriteria benefit '{col}' memiliki nilai maksimum nol atau negatif, normalisasi SAW tidak dapat dihitung.")
                self.normalized[col] = self.df[col] / max_val
        
        return self.normalized
    
    def calculate_scores(self):
        self.df['score'] = 0.0
        
        for col in ['price', 'range', 'top_speed', 'battery']:
            w = self.weights[col]
            self.df['score'] += w * self.normalized[col]
        
        return self.df
    
    def rank(self):
        self.df = self.df.sort_values('score', ascending=False).reset_index(drop=True)
        self.df['rank'] = range(1, len(self.df) + 1)
        return self.df
    
    def get_top_n(self, n=10):
        cols = ['rank', 'name', 'price', 'range', 'top_speed', 'battery', 'score']
        top = self.df[cols].head(n)
        return top.to_dict('records')
    
    def compute(self):
        self.normalize()
        self.calculate_scores()
        self.rank()
        
        stats = {
            'total': len(self.df),
            'mean_score': float(self.df['score'].mean()),
            'std_score': float(self.df['score'].std()),
            'min_score': float(self.df['score'].min()),
            'max_score': float(self.df['score'].max())
        }
        
        return {
            'top_10': self.get_top_n(10),
            'statistics': stats,
            'all_ranked': self.df[['rank', 'name', 'score']].to_dict('records')
        }
