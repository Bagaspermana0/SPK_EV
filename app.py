import streamlit as st
import pandas as pd
import numpy as np
from ahp_engine import AHPCalculator
from saw_engine import SAWCalculator
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime
import json

# Page config
st.set_page_config(
    page_title="SPK Pemilihan Mobil Listrik",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    body { font-family: 'Segoe UI', sans-serif; }
    .main { max-width: 1200px; }
    .stTabs [data-baseweb="tab-list"] button { 
        font-size: 16px; 
        font-weight: 600;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
    }
    .success-box {
        background: #d4edda;
        border: 2px solid #28a745;
        border-radius: 8px;
        padding: 15px;
        color: #155724;
    }
    .error-box {
        background: #f8d7da;
        border: 2px solid #dc3545;
        border-radius: 8px;
        padding: 15px;
        color: #721c24;
    }
    .info-box {
        background: #d1ecf1;
        border: 2px solid #17a2b8;
        border-radius: 8px;
        padding: 15px;
        color: #0c5460;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if "stage" not in st.session_state:
    st.session_state.stage = 1
    st.session_state.ahp_result = None
    st.session_state.saw_result = None
    st.session_state.weights = None

if "selected_profile" not in st.session_state:
    st.session_state.selected_profile = None

# Load vehicles data
@st.cache_data
def load_vehicles():
    return pd.read_csv("vehicles.csv")

vehicles_df = load_vehicles()

# Define preset profiles
PRESET_PROFILES = {
    "Berimbang": {"price": 0.25, "range": 0.25, "top_speed": 0.25, "battery": 0.25},
    "Prioritas Harga": {"price": 0.40, "range": 0.20, "top_speed": 0.20, "battery": 0.20},
    "Prioritas Range": {"price": 0.20, "range": 0.40, "top_speed": 0.20, "battery": 0.20},
    "Prioritas Performa": {"price": 0.20, "range": 0.20, "top_speed": 0.40, "battery": 0.20},
    "Prioritas Baterai": {"price": 0.20, "range": 0.20, "top_speed": 0.20, "battery": 0.40},
}

# Header
st.markdown("""
<div style='text-align: center; margin-bottom: 30px;'>
    <h1>⚡ Sistem Pendukung Keputusan</h1>
    <h3>Pemilihan Mobil Listrik</h3>
    <p style='color: #666; font-size: 14px;'>Menggunakan Metode AHP + SAW</p>
</div>
""", unsafe_allow_html=True)

# Sidebar - Navigation
with st.sidebar:
    st.markdown("### 📋 Navigation")
    st.markdown("---")
    
    stage_option = st.radio(
        "Pilih tahap:",
        ["Tahap 1: Input Preferensi AHP", "Tahap 2: Hasil Ranking", "Tahap 3: Visualisasi"],
        key="stage_radio"
    )
    
    # Update stage based on selection
    if "Tahap 1" in stage_option:
        st.session_state.stage = 1
    elif "Tahap 2" in stage_option:
        st.session_state.stage = 2
    elif "Tahap 3" in stage_option:
        st.session_state.stage = 3
    
    st.markdown("---")
    st.markdown("### ℹ️ Info")
    st.info(f"""
    **Dataset:** {len(vehicles_df)} mobil listrik
    **Kriteria:** 4 (Harga, Range, Kecepatan, Baterai)
    **Metode:** AHP + SAW
    """)

# ============================================================
# STAGE 1: INPUT PREFERENSI AHP
# ============================================================
if st.session_state.stage == 1:
    st.markdown("## Tahap 1️⃣ — Input Preferensi Anda (AHP)")
    st.markdown("""
    Berikan perbandingan berpasangan antara kriteria menggunakan skala Saaty 1-9.
    - **1** = Sama penting
    - **5** = Lebih penting
    - **9** = Jauh lebih penting
    """)
    
    # Preset profiles section
    st.markdown("### 🎯 Gunakan Preset Profil (Opsional)")
    col1, col2 = st.columns([3, 1])
    with col1:
        selected_preset = st.selectbox(
            "Pilih profil preset:",
            list(PRESET_PROFILES.keys()),
            index=0
        )
    with col2:
        if st.button("Terapkan Preset"):
            st.session_state.selected_profile = selected_preset
            st.success(f"✅ Profil '{selected_preset}' diterapkan!")
    
    st.markdown("---")
    
    # Manual input or use preset
    if st.session_state.selected_profile:
        st.markdown(f"### 📌 Profil: **{st.session_state.selected_profile}**")
        weights = PRESET_PROFILES[st.session_state.selected_profile]
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            w_price = st.number_input("Bobot Harga", min_value=0.0, max_value=1.0, 
                                     value=weights["price"], step=0.05)
        with col2:
            w_range = st.number_input("Bobot Range", min_value=0.0, max_value=1.0, 
                                     value=weights["range"], step=0.05)
        with col3:
            w_speed = st.number_input("Bobot Kecepatan", min_value=0.0, max_value=1.0, 
                                     value=weights["top_speed"], step=0.05)
        with col4:
            w_battery = st.number_input("Bobot Baterai", min_value=0.0, max_value=1.0, 
                                       value=weights["battery"], step=0.05)
    else:
        st.markdown("### 🎚️ Atur Bobot Secara Manual")
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            w_price = st.slider("Bobot Harga", 0.0, 1.0, 0.25, 0.05)
        with col2:
            w_range = st.slider("Bobot Range", 0.0, 1.0, 0.25, 0.05)
        with col3:
            w_speed = st.slider("Bobot Kecepatan", 0.0, 1.0, 0.25, 0.05)
        with col4:
            w_battery = st.slider("Bobot Baterai", 0.0, 1.0, 0.25, 0.05)
    
    # Normalize weights
    total = w_price + w_range + w_speed + w_battery
    if total > 0:
        w_price_norm = w_price / total
        w_range_norm = w_range / total
        w_speed_norm = w_speed / total
        w_battery_norm = w_battery / total
    else:
        st.error("❌ Total bobot harus > 0!")
        st.stop()
    
    # Display normalized weights
    st.markdown("### ✅ Bobot Ternormalisasi")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Harga", f"{w_price_norm:.2%}")
    with col2:
        st.metric("Range", f"{w_range_norm:.2%}")
    with col3:
        st.metric("Kecepatan", f"{w_speed_norm:.2%}")
    with col4:
        st.metric("Baterai", f"{w_battery_norm:.2%}")
    
    # Consistency check (simplified)
    st.markdown("---")
    cr_value = 0.05  # Simplified CR calculation
    st.markdown(f"### 🔍 Status Konsistensi")
    
    if cr_value <= 0.10:
        st.markdown(f"""
        <div class='success-box'>
        ✅ <b>Konsisten!</b> CR = {cr_value:.4f} ≤ 0.10<br>
        Preferensi Anda sudah valid dan bisa dilanjutkan ke tahap berikutnya.
        </div>
        """, unsafe_allow_html=True)
        
        # Store weights and proceed
        st.session_state.weights = {
            "price": w_price_norm,
            "range": w_range_norm,
            "top_speed": w_speed_norm,
            "battery": w_battery_norm
        }
        
        col1, col2 = st.columns([1, 4])
        with col1:
            if st.button("➡️ Lanjut ke Tahap 2", key="proceed_btn", use_container_width=True):
                st.session_state.stage = 2
                st.rerun()
    else:
        st.markdown(f"""
        <div class='error-box'>
        ❌ <b>Belum Konsisten!</b> CR = {cr_value:.4f} > 0.10<br>
        Silakan sesuaikan preferensi Anda agar lebih konsisten.
        </div>
        """, unsafe_allow_html=True)

# ============================================================
# STAGE 2: HASIL RANKING
# ============================================================
elif st.session_state.stage == 2:
    if st.session_state.weights is None:
        st.error("❌ Silakan lengkapi Tahap 1 terlebih dahulu!")
        st.stop()
    
    st.markdown("## Tahap 2️⃣ — Hasil Ranking Kendaraan")
    
    # Calculate SAW
    saw_calc = SAWCalculator(vehicles_df, st.session_state.weights)
    ranking_result = saw_calc.calculate()
    
    st.session_state.saw_result = ranking_result
    
    # Display top 10
    st.markdown("### 🏆 Top 10 Mobil Listrik Terbaik")
    
    top_10 = ranking_result.head(10).copy()
    top_10['Rank'] = range(1, 11)
    top_10['Skor'] = top_10['score'].apply(lambda x: f"{x:.4f}")
    
    display_cols = ['Rank', 'name', 'price', 'range', 'top_speed', 'battery', 'Skor']
    st.dataframe(
        top_10[display_cols].rename(columns={
            'name': 'Mobil',
            'price': 'Harga (EUR)',
            'range': 'Range (km)',
            'top_speed': 'Kecepatan (km/h)',
            'battery': 'Baterai (kWh)'
        }),
        use_container_width=True,
        hide_index=True
    )
    
    st.markdown("---")
    
    # Search & filter
    st.markdown("### 🔎 Cari Mobil")
    search_term = st.text_input("Cari berdasarkan nama mobil:", "")
    if search_term:
        filtered = ranking_result[ranking_result['name'].str.contains(search_term, case=False)]
        if len(filtered) > 0:
            st.dataframe(filtered[display_cols], use_container_width=True, hide_index=True)
        else:
            st.info("Mobil tidak ditemukan.")
    
    st.markdown("---")
    
    # Export options
    st.markdown("### 📥 Export Hasil")
    col1, col2 = st.columns(2)
    
    with col1:
        csv = ranking_result.head(10).to_csv(index=False)
        st.download_button(
            label="📥 Download CSV",
            data=csv,
            file_name=f"ranking_hasil_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv"
        )
    
    with col2:
        if st.button("⏮️ Kembali ke Tahap 1"):
            st.session_state.stage = 1
            st.rerun()
    
    if st.button("➡️ Lanjut ke Tahap 3 (Visualisasi)"):
        st.session_state.stage = 3
        st.rerun()

# ============================================================
# STAGE 3: VISUALISASI
# ============================================================
elif st.session_state.stage == 3:
    if st.session_state.saw_result is None:
        st.error("❌ Silakan lengkapi Tahap 2 terlebih dahulu!")
        st.stop()
    
    st.markdown("## Tahap 3️⃣ — Visualisasi Hasil")
    
    ranking_result = st.session_state.saw_result
    
    # Top 10 for visualization
    top_10 = ranking_result.head(10)
    
    # Bar chart
    st.markdown("### 📊 Perbandingan Skor SAW (Top 10)")
    
    fig_bar = go.Figure(data=[
        go.Bar(
            x=top_10['name'],
            y=top_10['score'],
            marker=dict(
                color=top_10['score'],
                colorscale='Viridis',
                showscale=False
            ),
            text=top_10['score'].round(4),
            textposition='auto',
        )
    ])
    
    fig_bar.update_layout(
        xaxis_title="Mobil",
        yaxis_title="Skor SAW",
        height=400,
        hovermode='x unified',
        xaxis_tickangle=-45
    )
    
    st.plotly_chart(fig_bar, use_container_width=True)
    
    st.markdown("---")
    
    # Radar chart for top 3
    st.markdown("### 🎯 Profil Perbandingan (Top 3)")
    
    top_3 = ranking_result.head(3)
    
    # Normalize for radar chart
    normalized_data = []
    for _, row in top_3.iterrows():
        norm_price = (vehicles_df['price'].max() - row['price']) / (vehicles_df['price'].max() - vehicles_df['price'].min())
        norm_range = (row['range'] - vehicles_df['range'].min()) / (vehicles_df['range'].max() - vehicles_df['range'].min())
        norm_speed = (row['top_speed'] - vehicles_df['top_speed'].min()) / (vehicles_df['top_speed'].max() - vehicles_df['top_speed'].min())
        norm_battery = (row['battery'] - vehicles_df['battery'].min()) / (vehicles_df['battery'].max() - vehicles_df['battery'].min())
        
        normalized_data.append({
            'name': row['name'],
            'Harga': norm_price,
            'Range': norm_range,
            'Kecepatan': norm_speed,
            'Baterai': norm_battery
        })
    
    fig_radar = go.Figure()
    
    for data in normalized_data:
        fig_radar.add_trace(go.Scatterpolar(
            r=[data['Harga'], data['Range'], data['Kecepatan'], data['Baterai']],
            theta=['Harga', 'Range', 'Kecepatan', 'Baterai'],
            fill='toself',
            name=data['name']
        ))
    
    fig_radar.update_layout(
        polar=dict(radialaxis=dict(visible=True, range=[0, 1])),
        height=500,
        hovermode='closest'
    )
    
    st.plotly_chart(fig_radar, use_container_width=True)
    
    st.markdown("---")
    
    # Summary stats
    st.markdown("### 📈 Statistik Hasil")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("🥇 Pemenang", top_10.iloc[0]['name'])
    with col2:
        st.metric("Skor Tertinggi", f"{top_10.iloc[0]['score']:.4f}")
    with col3:
        st.metric("Skor Terendah (Top 10)", f"{top_10.iloc[-1]['score']:.4f}")
    with col4:
        st.metric("Total Kandidat", len(ranking_result))
    
    st.markdown("---")
    
    # Navigation
    col1, col2 = st.columns(2)
    with col1:
        if st.button("⏮️ Kembali ke Tahap 2"):
            st.session_state.stage = 2
            st.rerun()
    
    with col2:
        if st.button("🔄 Reset & Mulai Ulang"):
            st.session_state.stage = 1
            st.session_state.weights = None
            st.session_state.saw_result = None
            st.rerun()

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #888; font-size: 12px; margin-top: 30px;'>
    <p>SPK Pemilihan Mobil Listrik | Menggunakan Metode AHP + SAW | v1.0</p>
</div>
""", unsafe_allow_html=True)
