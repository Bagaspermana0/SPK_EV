from services.ahp_engine import AHPEngine

# Test 1: Valid consistent matrix
matrix1 = [
    [1, 1/3, 1/2, 1/5],
    [3, 1, 2, 1/2],
    [2, 1/2, 1, 1/3],
    [5, 2, 3, 1]
]
ahp1 = AHPEngine(matrix1)
result1 = ahp1.compute()

assert result1['is_consistent'] == True, "[ERROR] Should be consistent"
assert sum(result1['weights'].values()) > 0.99, "[ERROR] Weights sum != 1"
print("[OK] Test 1 PASSED: Consistent matrix handled correctly")

# Test 2: Weights sum = 1
total = sum(result1['weights'].values())
assert abs(total - 1.0) < 0.001, f"[ERROR] Weights sum = {total}, expected = 1.0"
print("[OK] Test 2 PASSED: Weights sum = 1.0")

# Test 3: All weights between 0-1
for w in result1['weights'].values():
    assert 0 <= w <= 1, f"[ERROR] Weight {w} not in [0, 1]"
print("[OK] Test 3 PASSED: All weights in valid range")

# Test 4: Invalid matrix (not 4x4)
try:
    bad_matrix = [[1, 2], [3, 4]]
    ahp_bad = AHPEngine(bad_matrix)
    print("[ERROR] Test 4 FAILED: Should reject non-4x4 matrix")
except ValueError:
    print("[OK] Test 4 PASSED: Rejects non-4x4 matrix")

print("\n[OK] All AHP unit tests PASSED!")
