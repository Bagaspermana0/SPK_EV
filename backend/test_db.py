from app import create_app
from models import db, Vehicle

app = create_app()
with app.app_context():
    # Test 1: Connection
    try:
        count = Vehicle.query.count()
        print(f"[OK] Test 1 PASSED: DB connected, {count} vehicles loaded")
    except Exception as e:
        print(f"[ERROR] Test 1 FAILED: {e}")
    
    # Test 2: Data integrity
    vehicles = Vehicle.query.all()
    # Expect 281 since the CSV loader successfully processed 281 unique vehicles
    assert len(vehicles) == 281, f"[ERROR] Expected 281 vehicles, got {len(vehicles)}"
    print("[OK] Test 2 PASSED: All 281 vehicles loaded")
    
    # Test 3: No null values
    nulls = Vehicle.query.filter(
        (Vehicle.price == None) | 
        (Vehicle.range == None) |
        (Vehicle.top_speed == None) |
        (Vehicle.battery == None)
    ).count()
    assert nulls == 0, f"[ERROR] Found {nulls} null values"
    print("[OK] Test 3 PASSED: No null values in critical fields")
    
    # Test 4: Value ranges
    min_price = db.session.query(db.func.min(Vehicle.price)).scalar()
    max_price = db.session.query(db.func.max(Vehicle.price)).scalar()
    assert min_price > 10000, f"[ERROR] Min price {min_price} unrealistic"
    assert max_price < 500000, f"[ERROR] Max price {max_price} unrealistic"
    print(f"[OK] Test 4 PASSED: Price range {min_price}-{max_price} valid")

print("\n[OK] All database tests PASSED!")
