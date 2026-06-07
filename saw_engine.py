import numpy as np
import pandas as pd

class SAWCalculator:
    """
    Simple Additive Weighting (SAW) Calculator
    Menghitung skor dan ranking alternatif berdasarkan bobot kriteria
    """
    
    def __init__(self, vehicles_df, weights_dict):
        """
        vehicles_df: DataFrame dengan kolom [name, price, range, top_speed, battery]
        weights_dict: {'price': w1, 'range': w2, 'top_speed': w3, 'battery': w4}
        """
        self.vehicles_df = vehicles_df.copy()
        self.weights = weights_dict
        self.criteria = ['price', 'range', 'top_speed', 'battery']
        
        # Identifikasi tipe kriteria
        self.benefit_criteria = ['range', 'top_speed', 'battery']  # Lebih tinggi = lebih baik
        self.cost_criteria = ['price']  # Lebih rendah = lebih baik
    
    def normalize_benefit(self, values):
        """
        Normalisasi untuk benefit criteria (higher is better)
        Formula: x_ij / max(x_j)
        """
        max_val = values.max()
        if max_val == 0:
            return values
        return values / max_val
    
    def normalize_cost(self, values):
        """
        Normalisasi untuk cost criteria (lower is better)
        Formula: min(x_j) / x_ij
        """
        min_val = values.min()
        if min_val == 0:
            return values
        return min_val / values
    
    def normalize_all_criteria(self):
        """Normalisasi semua kriteria"""
        normalized_data = self.vehicles_df.copy()
        
        # Normalisasi benefit criteria
        for criterion in self.benefit_criteria:
            normalized_data[f'{criterion}_norm'] = self.normalize_benefit(
                self.vehicles_df[criterion]
            )
        
        # Normalisasi cost criteria
        for criterion in self.cost_criteria:
            normalized_data[f'{criterion}_norm'] = self.normalize_cost(
                self.vehicles_df[criterion]
            )
        
        return normalized_data
    
    def calculate_scores(self, normalized_data):
        """
        Hitung skor akhir untuk setiap alternatif
        Formula: V_i = Σ(w_j * r_ij)
        dimana:
        - V_i = skor alternatif i
        - w_j = bobot kriteria j
        - r_ij = nilai normalisasi alternatif i untuk kriteria j
        """
        scores = []
        
        for idx, row in normalized_data.iterrows():
            score = 0
            for criterion in self.criteria:
                norm_col = f'{criterion}_norm'
                weight = self.weights[criterion]
                normalized_value = row[norm_col]
                score += weight * normalized_value
            
            scores.append(score)
        
        return scores
    
    def calculate(self):
        """
        Jalankan SAW lengkap dan return ranking hasil
        Output: DataFrame dengan kolom original + score, diurutkan descending
        """
        # Normalisasi
        normalized_data = self.normalize_all_criteria()
        
        # Hitung skor
        scores = self.calculate_scores(normalized_data)
        
        # Tambah score ke dataframe
        result = self.vehicles_df.copy()
        result['score'] = scores
        
        # Urutkan descending (skor tertinggi di atas)
        result = result.sort_values('score', ascending=False).reset_index(drop=True)
        
        return result
    
    def calculate_sensitivity(self, alternative_weights_list):
        """
        Analisis sensitivitas: jalankan SAW dengan berbagai bobot
        Input: List of weights dict
        Output: DataFrame dengan ranking untuk setiap skenario
        """
        results = {}
        
        for idx, weights in enumerate(alternative_weights_list):
            calc = SAWCalculator(self.vehicles_df, weights)
            ranking = calc.calculate()
            results[f'Skenario_{idx+1}'] = ranking[['name', 'score']].head(5)
        
        return results


class SAWDetailedAnalysis:
    """Analisis detail untuk SAW (breakdown per kriteria)"""
    
    def __init__(self, vehicles_df, weights_dict):
        self.vehicles_df = vehicles_df
        self.weights = weights_dict
        self.saw = SAWCalculator(vehicles_df, weights_dict)
    
    def get_detailed_breakdown(self, vehicle_name, top_n=1):
        """
        Return breakdown skor untuk kendaraan tertentu
        Menunjukkan kontribusi setiap kriteria terhadap skor akhir
        """
        ranking = self.saw.calculate()
        vehicle = ranking[ranking['name'] == vehicle_name]
        
        if len(vehicle) == 0:
            return None
        
        row = vehicle.iloc[0]
        
        # Hitung normalisasi manual untuk breakdown
        normalized_data = self.saw.normalize_all_criteria()
        norm_row = normalized_data[normalized_data.index == vehicle.index[0]].iloc[0]
        
        breakdown = {
            'vehicle_name': vehicle_name,
            'total_score': row['score'],
            'criteria_contributions': {}
        }
        
        for criterion in ['price', 'range', 'top_speed', 'battery']:
            norm_val = norm_row[f'{criterion}_norm']
            weight = self.weights[criterion]
            contribution = weight * norm_val
            
            breakdown['criteria_contributions'][criterion] = {
                'normalized_value': norm_val,
                'weight': weight,
                'contribution': contribution
            }
        
        return breakdown
