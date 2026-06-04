from services.saw_engine import SAWEngine

# Prepare test data
test_vehicles = [
    {'name': 'Tesla Model 3', 'price': 50000, 'range': 560, 'top_speed': 225, 'battery': 82},
    {'name': 'Nissan Leaf', 'price': 32000, 'range': 270, 'top_speed': 160, 'battery': 62},
    {'name': 'VW ID.4', 'price': 55000, 'range': 520, 'top_speed': 180, 'battery': 82},
    {'name': 'BMW i3', 'price': 45000, 'range': 260, 'top_speed': 160, 'battery': 42},
    {'name': 'Renault Zoe', 'price': 35000, 'range': 390, 'top_speed': 170, 'battery': 65},
]

weights = {
    'price': 0.30,
    'range': 0.35,
    'top_speed': 0.15,
    'battery': 0.20
}

saw = SAWEngine(test_vehicles, weights)
result = saw.compute()

# Test 1: Top ranking vehicle
top1 = result['top_10'][0]
assert top1['rank'] == 1, "[ERROR] First rank != 1"
assert top1['score'] > 0 and top1['score'] <= 1, "[ERROR] Score not in [0, 1]"
print(f"[OK] Test 1 PASSED: Top vehicle = {top1['name']} with score {top1['score']:.4f}")

# Test 2: Ranking ordered descending
scores = [v['score'] for v in result['top_10']]
assert scores == sorted(scores, reverse=True), "[ERROR] Scores not in descending order"
print("[OK] Test 2 PASSED: Ranking sorted descending")

# Test 3: Statistics calculated
stats = result['statistics']
assert 'mean_score' in stats, "[ERROR] Missing mean_score"
assert 'std_score' in stats, "[ERROR] Missing std_score"
assert stats['mean_score'] > 0, "[ERROR] Mean score = 0"
print(f"[OK] Test 3 PASSED: Statistics OK (mean={stats['mean_score']:.4f})")

print("\n[OK] All SAW unit tests PASSED!")
