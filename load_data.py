import os
import re
import pandas as pd
from sqlalchemy import create_engine, text

# Database config
DB_USER = 'postgres'
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')  # We will read from prompt if empty
DB_HOST = 'localhost'
DB_PORT = 5432
DB_NAME = 'spk_mobil_listrik'

# Prompt password if not set
if not DB_PASSWORD:
    DB_PASSWORD = input("Masukkan password PostgreSQL Anda: ")

DB_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

def parse_price(val):
    if pd.isna(val) or str(val).strip() == 'N/A':
        return None
    # Remove € and commas
    cleaned = re.sub(r'[^\d]', '', str(val))
    return float(cleaned) if cleaned else None

def parse_range(val):
    if pd.isna(val) or str(val).strip() == 'N/A':
        return None
    # Extract digits before km
    match = re.search(r'(\d+)\s*km', str(val))
    return float(match.group(1)) if match else None

def parse_top_speed(val):
    if pd.isna(val) or str(val).strip() == 'N/A':
        return None
    match = re.search(r'(\d+)\s*km/h', str(val))
    return float(match.group(1)) if match else None

def parse_battery(val):
    if pd.isna(val):
        return None
    # Subtitle has e.g. "118 kWh useable battery..."
    match = re.search(r'(\d+(?:\.\d+)?)\s*kWh', str(val))
    return float(match.group(1)) if match else None

try:
    print("📊 Loading data from CSV...")
    df = pd.read_csv('electric_cars.csv')
    
    # Process columns
    df['name'] = df['Name']
    df['price'] = df['PriceinGermany'].apply(parse_price)
    df['range'] = df['Range'].apply(parse_range)
    df['top_speed'] = df['TopSpeed'].apply(parse_top_speed)
    df['battery'] = df['Subtitle'].apply(parse_battery)
    
    # Drop rows where critical columns are null
    df = df.dropna(subset=['name', 'price', 'range', 'top_speed', 'battery'])
    
    # Keep only relevant columns
    df = df[['name', 'price', 'range', 'top_speed', 'battery']]
    
    # Remove duplicates
    df = df.drop_duplicates(subset=['name'], keep='first')
    
    print(f"✅ CSV loaded and cleaned: {len(df)} vehicles")
    
    # Connect to database
    engine = create_engine(DB_URL)
    
    # Insert data
    df.to_sql('vehicles', engine, if_exists='append', index=False)
    print(f"✅ Data successfully loaded to database: {len(df)} vehicles")
    
    # Verify
    with engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM vehicles;"))
        count = result.fetchone()[0]
        print(f"✅ Total vehicles in database: {count}")
        
        # Show first 3 rows
        result = conn.execute(text("SELECT * FROM vehicles LIMIT 3;"))
        print("\n📋 Sample data:")
        for row in result:
            # row is tuple: (id, name, price, range, top_speed, battery, created_at)
            # row index matches column positions:
            # 0: id, 1: name, 2: price, 3: range, 4: top_speed, 5: battery, 6: created_at
            print(f"   - {row[1]}: €{row[2]:.0f} | Range: {row[3]} km | Top Speed: {row[4]} km/h | Battery: {row[5]} kWh")

except Exception as e:
    print(f"❌ ERROR: {e}")
