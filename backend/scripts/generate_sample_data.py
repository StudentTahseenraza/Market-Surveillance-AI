# backend/scripts/generate_sample_data.py
import random
import pandas as pd
from datetime import datetime, timedelta
import numpy as np
import requests
import time
import os

def generate_stock_data(symbol, days=365):
    """Generate realistic stock data with occasional anomalies"""
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    dates = []
    current_date = start_date
    
    while current_date <= end_date:
        if current_date.weekday() < 5:  # Monday to Friday
            dates.append(current_date)
        current_date += timedelta(days=1)
    
    # Generate base price with random walk
    base_prices = {
        'RELIANCE': 2500,
        'TCS': 3500,
        'HDFCBANK': 1600,
        'INFY': 1500,
        'ICICIBANK': 1000,
        'SBIN': 600,
        'BHARTIARTL': 800,
        'ITC': 400,
        'KOTAKBANK': 1800,
        'LT': 2800,
        'WIPRO': 400,
        'AXISBANK': 900,
        'MARUTI': 9500,
        'SUNPHARMA': 1200,
        'TATAMOTORS': 500
    }
    base_price = base_prices.get(symbol, 1000)
    
    prices = []
    volumes = []
    
    for i in range(len(dates)):
        if i == 0:
            price = base_price
        else:
            # Random walk with drift
            change = np.random.normal(0.0005, 0.015)  # 0.05% drift, 1.5% volatility
            price = prices[-1] * (1 + change)
        
        # Add occasional anomaly (3% chance)
        if random.random() < 0.03:
            price *= (1 + random.choice([-0.08, -0.05, 0.05, 0.08]))
        
        prices.append(price)
        
        # Generate volume
        base_volume = np.random.normal(2000000, 500000)
        if i > 0 and abs(prices[i] - prices[i-1]) / prices[i-1] > 0.03:
            volume = int(base_volume * random.uniform(1.5, 2.5))  # Spike volume on big moves
        else:
            volume = int(base_volume)
        
        volumes.append(max(100000, int(volume)))  # Ensure minimum volume
    
    # Create DataFrame
    df = pd.DataFrame({
        'date': dates,
        'symbol': symbol,
        'open': [round(p * (1 - random.uniform(0, 0.01)), 2) for p in prices],
        'high': [round(p * (1 + random.uniform(0, 0.015)), 2) for p in prices],
        'low': [round(p * (1 - random.uniform(0, 0.015)), 2) for p in prices],
        'close': [round(p, 2) for p in prices],
        'volume': volumes
    })
    
    return df

def upload_to_api(symbol, df):
    """Upload data to API with better error handling"""
    
    # Save to CSV temporarily
    csv_file = f"temp_{symbol}.csv"
    df.to_csv(csv_file, index=False)
    
    try:
        # Wait for backend to be ready
        time.sleep(1)
        
        # Upload via API
        url = "http://localhost:8000/api/v1/stocks/upload"
        headers = {
            'Authorization': f'Bearer {get_token()}'
        }
        
        with open(csv_file, 'rb') as f:
            files = {'file': (f.name, f, 'text/csv')}
            data = {'symbol': symbol}
            
            response = requests.post(url, files=files, data=data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Uploaded {symbol}: {result['records']} records")
                return True
            else:
                print(f"❌ Failed to upload {symbol}: {response.text}")
                return False
                
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to backend. Make sure it's running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error uploading {symbol}: {e}")
        return False
    finally:
        # Clean up file
        try:
            if os.path.exists(csv_file):
                os.remove(csv_file)
        except:
            pass

def get_token():
    """Get authentication token"""
    try:
        url = "http://localhost:8000/api/v1/auth/token"
        data = {
            'username': 'admin',
            'password': 'admin123'
        }
        response = requests.post(url, data=data)
        if response.status_code == 200:
            return response.json()['access_token']
    except:
        pass
    return None

def check_backend():
    """Check if backend is running"""
    try:
        response = requests.get("http://localhost:8000/health")
        return response.status_code == 200
    except:
        return False

# Main execution
if __name__ == "__main__":
    print("🚀 Checking backend connection...")
    
    if not check_backend():
        print("❌ Backend is not running!")
        print("Please start backend first with:")
        print("cd C:\\Assignment\\Market-service-ai\\backend")
        print("uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        exit(1)
    
    print("✅ Backend is running!")
    
    symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 
               'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT']
    
    print(f"\n🚀 Generating sample stock data for {len(symbols)} symbols...")
    
    successful = 0
    for symbol in symbols:
        print(f"\n📊 Generating {symbol}...")
        df = generate_stock_data(symbol, days=365)
        print(f"   Generated {len(df)} records")
        
        if upload_to_api(symbol, df):
            successful += 1
        time.sleep(0.5)  # Small delay between uploads
    
    print(f"\n{'='*50}")
    print(f"✅ Successfully uploaded {successful}/{len(symbols)} symbols")
    print(f"{'='*50}")
    
    if successful > 0:
        print("\n🎉 Data generation complete! You can now:")
        print("1. Go to http://localhost:3000")
        print("2. Login with admin/admin123")
        print("3. View data on Dashboard and Analysis pages")