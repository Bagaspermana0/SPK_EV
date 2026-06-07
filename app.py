import streamlit as st
import pandas as pd
import numpy as np
from ahp_engine import AHPCalculator
from saw_engine import SAWCalculator
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime
import time

# Page config
st.set_page_config(
    page_title="SPK Pemilihan Mobil Listrik",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom SVG Icons (Lucide implementation)
def get_icon(icon_name, size=16, color="currentColor"):
    icons = {
        "zap": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        "dollar": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><path d="M12 18V6"/></svg>',
        "battery": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>',
        "cpu": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 15h3"/><path d="M1 9h3"/><path d="M1 15h3"/></svg>',
        "lock": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        "rotate": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
        "chart": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>',
        "list": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
        "help": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'
    }
    return icons.get(icon_name, "")

# Custom CSS styling reflecting the React App Dark Glassmorphism design system
st.markdown(f"""
<style>
    /* Design tokens */
    :root {{
      --bg-base:        #060E1A;
      --bg-layer:       #0B1628;
      --bg-elevated:    #101F36;
      --bg-overlay:     #152540;
      --glass-bg:           rgba(255, 255, 255, 0.03);
      --glass-bg-hover:     rgba(255, 255, 255, 0.06);
      --glass-border:       rgba(255, 255, 255, 0.07);
      --glass-border-hover: rgba(255, 255, 255, 0.15);
      --green:          #00D97E;
      --green-glow:     rgba(0, 217, 126, 0.25);
      --blue:           #3B82F6;
      --blue-glow:      rgba(59, 130, 246, 0.25);
      --amber:          #F59E0B;
      --teal:           #06B6D4;
      --red:            #EF4444;
    }}

    .stApp {{
      background-color: #060E1A !important;
      background-image:
        radial-gradient(ellipse 70% 40% at 20% 10%, rgba(0, 217, 126, 0.05) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 60%),
        radial-gradient(ellipse 50% 30% at 50% 50%, rgba(6, 182, 212, 0.02) 0%, transparent 70%) !important;
      background-attachment: fixed !important;
      color: #94A3B8 !important;
      font-family: 'Segoe UI', Arial, sans-serif !important;
    }}

    h1, h2, h3, h4 {{
      color: #F1F5F9 !important;
      font-family: 'Segoe UI', Arial, sans-serif !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.06em !important;
    }}

    /* Custom Header bar */
    .site-header {{
      background: rgba(6, 14, 26, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      width: 100%;
    }}
    .site-logo {{
      font-weight: 800;
      font-size: 1.2rem;
      letter-spacing: 0.08em;
      color: #F1F5F9;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .site-logo span {{
      color: #00D97E;
    }}
    .logo-dot {{
      width: 6px;
      height: 6px;
      background: #00D97E;
      display: inline-block;
      box-shadow: 0 0 8px #00D97E;
      border-radius: 50%;
    }}

    /* Custom visual steps progress */
    .step-tab-wrapper {{
      position: relative;
      margin-bottom: 30px;
      width: 100%;
    }}
    .tab-progress-bg {{
      height: 2px;
      background: rgba(255,255,255,0.04);
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }}
    .tab-progress-fill {{
      height: 100%;
      background: #00D97E;
      box-shadow: 0 0 8px #00D97E;
      transition: width 0.4s ease;
    }}
    .step-tabs {{
      display: flex;
      background: #0B1628;
      border: 1px solid rgba(255, 255, 255, 0.07);
      padding: 0;
      margin: 0;
      list-style: none;
      z-index: 2;
      position: relative;
    }}
    .step-tab {{
      flex: 1;
      color: #475569;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border-bottom: 2px solid transparent;
      text-align: center;
      transition: all 0.25s ease;
    }}
    .step-tab.active {{
      color: #00D97E;
      background: rgba(0, 217, 126, 0.01);
      border-bottom: 2px solid #00D97E;
    }}
    .step-num {{
      font-family: monospace;
      font-weight: 700;
      font-size: 0.95rem;
      background: rgba(255,255,255,0.05);
      color: #94A3B8;
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }}
    .step-tab.active .step-num {{
      background: #00D97E;
      color: #060E1A;
    }}

    /* Glass Cards */
    .glass-card {{
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.07);
      position: relative;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 24px;
      margin-bottom: 20px;
    }}
    .glass-card:hover {{
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.15);
    }}
    .glass-card-blue {{
      background: rgba(59, 130, 246, 0.01);
      border-color: rgba(59, 130, 246, 0.15);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.03);
    }}
    .glass-card-green {{
      background: rgba(0, 217, 126, 0.01);
      border-color: rgba(0, 217, 126, 0.15);
      box-shadow: 0 0 20px rgba(0, 217, 126, 0.03);
    }}
    .cut-top-right {{
      clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
    }}

    /* Section micro-label */
    .section-label {{
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 700;
      color: #00D97E;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }}

    /* Streamlit input fields dark override */
    .stTextInput input, .stSelectbox [data-baseweb="select"] {{
      background-color: rgba(255, 255, 255, 0.02) !important;
      border: 1px solid rgba(255, 255, 255, 0.07) !important;
      color: #F1F5F9 !important;
    }}
    .stTextInput input:focus, .stSelectbox [data-baseweb="select"]:focus-within {{
      border-color: #00D97E !important;
      box-shadow: 0 0 12px rgba(0, 217, 126, 0.1) !important;
    }}

    /* Sliders custom styles */
    .stSlider [data-baseweb="slider"] > div {{
      background-color: rgba(255, 255, 255, 0.07) !important;
    }}
    .stSlider [data-baseweb="slider"] [role="slider"] {{
      background-color: #00D97E !important;
      border: 2px solid #060E1A !important;
      box-shadow: 0 0 8px rgba(0, 217, 126, 0.8) !important;
    }}
    .stSlider [data-baseweb="slider"] > div > div {{
      background-color: #00D97E !important;
    }}

    /* Custom HTML Table */
    .table-responsive {{
      width: 100%;
      overflow-x: auto;
      margin-top: 10px;
      background: rgba(255,255,255,0.01);
      border: 1px solid rgba(255,255,255,0.07);
    }}
    .results-table {{
      width: 100%;
      border-collapse: collapse;
    }}
    .results-table th, .results-table td {{
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      font-size: 0.85rem;
      color: #94A3B8;
      text-align: left;
    }}
    .results-table th {{
      background: rgba(255, 255, 255, 0.01);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #475569;
      font-size: 0.68rem;
    }}
    .table-row-hover {{
      transition: background 0.2s ease;
    }}
    .table-row-hover:hover {{
      background: rgba(255, 255, 255, 0.02);
    }}
    .table-score-badge {{
      background: rgba(0, 217, 126, 0.12);
      color: #00D97E;
      border: 1px solid rgba(0, 217, 126, 0.2);
      padding: 3px 8px;
      font-weight: 700;
      font-family: monospace;
      font-size: 0.78rem;
    }}
    .numeric {{
      font-family: monospace;
      font-weight: 600;
    }}

    /* Styled buttons */
    div.stButton > button {{
      font-weight: 700 !important;
      letter-spacing: 0.08em !important;
      text-transform: uppercase !important;
      border-radius: 0px !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }}
    div.stButton > button[kind="primary"] {{
      background: #00D97E !important;
      color: #060E1A !important;
      border: none !important;
      clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%) !important;
      box-shadow: 0 4px 16px rgba(0, 217, 126, 0.15) !important;
    }}
    div.stButton > button[kind="primary"]:hover {{
      background: #00f28d !important;
      color: #060E1A !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 16px rgba(0, 217, 126, 0.35) !important;
    }}
    div.stButton > button[kind="secondary"] {{
      background: rgba(255,255,255,0.02) !important;
      border: 1px solid rgba(255,255,255,0.07) !important;
      color: #94A3B8 !important;
      clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%) !important;
    }}
    div.stButton > button[kind="secondary"]:hover {{
      border-color: #00D97E !important;
      color: #00D97E !important;
    }}

    /* Metrics custom container */
    div[data-testid="stMetric"] {{
      background: rgba(255, 255, 255, 0.02) !important;
      border: 1px solid rgba(255, 255, 255, 0.07) !important;
      padding: 16px 20px !important;
      box-shadow: 0 0 20px rgba(0, 217, 126, 0.03) !important;
    }}
    div[data-testid="stMetric"]:hover {{
      background: rgba(255, 255, 255, 0.05) !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }}

    /* Loading Overlay styling */
    .loading-overlay {{
      position: fixed;
      inset: 0;
      background: rgba(6, 14, 26, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }}
    .loading-container {{
      width: 100%;
      max-width: 440px;
      background: #0B1628;
      border: 1px solid rgba(0, 217, 126, 0.2);
      box-shadow: 0 24px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 217, 126, 0.08);
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      overflow: hidden;
    }}
    .loading-glow-bg {{
      position: absolute;
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(0, 217, 126, 0.08) 0%, transparent 70%);
      top: -60px;
      left: -60px;
      pointer-events: none;
      z-index: 0;
    }}
    .spinner-wrapper {{
      position: relative;
      width: 90px;
      height: 90px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }}
    .spinner-ring {{
      position: absolute;
      inset: 0;
      border: 3px solid rgba(255, 255, 255, 0.02);
      border-top-color: #00D97E;
      border-radius: 50%;
      animation: spinner-spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
      box-shadow: 0 0 12px rgba(0, 217, 126, 0.3);
    }}
    .spinner-ring-inner {{
      position: absolute;
      inset: 10px;
      border: 2px solid rgba(255, 255, 255, 0.02);
      border-top-color: #3B82F6;
      border-radius: 50%;
      animation: spinner-spin-reverse 1.8s linear infinite;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
    }}
    .spinner-core {{
      width: 48px;
      height: 48px;
      background: rgba(6, 14, 26, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 8px rgba(0, 217, 126, 0.15);
      z-index: 2;
    }}
    .spinner-zap-icon {{
      color: #00D97E;
      animation: spinner-pulse 1.5s ease-in-out infinite;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .loading-title {{
      font-size: 0.92rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #F1F5F9;
      margin-bottom: 16px;
      z-index: 1;
    }}
    .loading-steps-track {{
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.04);
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
    }}
    .loading-steps-progress {{
      height: 100%;
      background: linear-gradient(90deg, #3B82F6, #00D97E);
      box-shadow: 0 0 8px rgba(0, 217, 126, 0.4);
    }}
    .loading-step-text {{
      font-size: 0.78rem;
      color: #94A3B8;
      margin-bottom: 24px;
      min-height: 18px;
      z-index: 1;
    }}
    .loading-indicator-strip {{
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 1;
    }}
    .dot-pulse {{
      width: 6px;
      height: 6px;
      background: #00D97E;
      border-radius: 50%;
      box-shadow: 0 0 8px #00D97E;
      animation: dot-pulse-anim 1.2s ease-in-out infinite alternate;
    }}
    .loading-sub-text {{
      font-family: monospace;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #475569;
    }}

    @keyframes spinner-spin {{
      0% {{ transform: rotate(0deg); }}
      100% {{ transform: rotate(360deg); }}
    }}
    @keyframes spinner-spin-reverse {{
      0% {{ transform: rotate(360deg); }}
      100% {{ transform: rotate(0deg); }}
    }}
    @keyframes spinner-pulse {{
      0%, 100% {{ transform: scale(1); opacity: 0.85; }}
      50% {{ transform: scale(1.1); opacity: 1; }}
    }}
    @keyframes dot-pulse-anim {{
      0% {{ transform: scale(0.8); opacity: 0.5; }}
      100% {{ transform: scale(1.2); opacity: 1; }}
    }}
</style>
""", unsafe_allow_html=True)

# Initialize session state variables
if "stage" not in st.session_state:
    st.session_state.stage = 1
    st.session_state.weights = None
    st.session_state.cr = None
    st.session_state.saw_result = None
    st.session_state.show_loading = False

# AHP Sliders session state (6 pairwise comparisons)
if "sliders" not in st.session_state:
    st.session_state.sliders = [9, 9, 9, 9, 9, 9]

# Preset selector state
if "active_preset" not in st.session_state:
    st.session_state.active_preset = "equal"

# Preset Profiles Mapping (Matches old React code)
PRESETS = {
    "equal": [9, 9, 9, 9, 9, 9],
    "price_first": [5, 5, 6, 9, 9, 9],
    "range_first": [12, 9, 9, 6, 6, 9],
    "speed_first": [9, 12, 9, 12, 9, 6],
    "balanced_ev": [7, 8, 8, 9, 9, 9],
}

PRESET_DESCRIPTIONS = {
    "equal": "Semua kriteria memiliki bobot kepentingan sama (25%).",
    "price_first": "Prioritas utama pada aspek anggaran/harga murah.",
    "range_first": "Prioritas pada efisiensi daya dan jarak tempuh terjauh.",
    "speed_first": "Prioritas pada tenaga mesin dan kecepatan tinggi.",
    "balanced_ev": "Kompromi optimal antara efisiensi, performa, dan harga.",
}

# AHP Matrix Pairs index definition
PAIRS = [
    (0, 1, "Harga", "Range", "dollar", "battery"),
    (0, 2, "Harga", "Kecepatan", "dollar", "zap"),
    (0, 3, "Harga", "Baterai", "dollar", "cpu"),
    (1, 2, "Range", "Kecepatan", "battery", "zap"),
    (1, 3, "Range", "Baterai", "battery", "cpu"),
    (2, 3, "Kecepatan", "Baterai", "zap", "cpu")
]

# Helper mapping slider pos (1-17) to Saaty Scale (1/9 to 9)
def slider_to_ahp(pos):
    if pos == 9:
        return 1.0
    elif pos < 9:
        return float(10 - pos)
    else:
        return 1.0 / float(pos - 8)

def get_comparison_text(left_name, right_name, pos):
    if pos == 9:
        return "Kedua kriteria dinilai sama penting (Equal Importance)"
    elif pos < 9:
        factor = int(10 - pos)
        return f"Kriteria <b>{left_name}</b> {factor}x lebih penting dari <b>{right_name}</b>"
    else:
        factor = int(pos - 8)
        return f"Kriteria <b>{right_name}</b> {factor}x lebih penting dari <b>{left_name}</b>"

# Confetti effect integration (simulated inside Streamlit success widget)
def trigger_confetti():
    st.balloons()

# Load dataset
@st.cache_data
def load_vehicles():
    try:
        return pd.read_csv("vehicles.csv")
    except Exception as e:
        st.error(f"Error loading database: {e}")
        return pd.DataFrame()

vehicles_df = load_vehicles()

# ──────────────────────────────────────────────────────────
# HEADER SECTION
# ──────────────────────────────────────────────────────────
st.markdown(f"""
<div class="site-header">
    <div class="site-logo">
        <span class="logo-dot"></span>
        EV<span>Finder</span>
        <span style="color: rgba(255,255,255,0.15); margin: 0 8px;">|</span>
        <span style="font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; color: #475569;">
            Sistem Pendukung Keputusan Mobil Listrik
        </span>
    </div>
    <div style="display: flex; gap: 8px; alignItems: center;">
        <span style="width: 6px; height: 6px; background: #00D97E; border-radius: 50%; display: inline-block; box-shadow: 0 0 6px #00D97E; margin-top: 6px;"></span>
        <span style="font-size: 0.68rem; color: #94A3B8; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; fontFamily: monospace;">
            {len(vehicles_df)} VEHICLES ONLINE
        </span>
    </div>
</div>
""", unsafe_allow_html=True)

# ──────────────────────────────────────────────────────────
# STEP NAVIGATION PROGRESS BAR
# ──────────────────────────────────────────────────────────
progress_pct = 16
if st.session_state.stage == 2:
    progress_pct = 58
elif st.session_state.stage == 3:
    progress_pct = 100

active_1 = "active" if st.session_state.stage == 1 else ""
active_2 = "active" if st.session_state.stage == 2 else ""
active_3 = "active" if st.session_state.stage == 3 else ""

st.markdown(f"""
<div class="step-tab-wrapper">
    <div class="tab-progress-bg">
        <div class="tab-progress-fill" style="width: {progress_pct}%;"></div>
    </div>
    <div class="step-tabs">
        <div class="step-tab {active_1}">
            <span class="step-num">1</span> Input Preferensi AHP
        </div>
        <div class="step-tab {active_2}">
            <span class="step-num">2</span> Hasil Ranking SAW
        </div>
        <div class="step-tab {active_3}">
            <span class="step-num">3</span> Visualisasi & Detail
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Sidebar - Preset and Info
with st.sidebar:
    st.markdown("### 📋 Navigasi Cepat")
    st.markdown("---")
    
    selected_stage = st.radio(
        "Pindah Tahap:",
        ["Tahap 1: Input AHP", "Tahap 2: Hasil Ranking", "Tahap 3: Visualisasi"],
        index=st.session_state.stage - 1
    )
    
    if "Tahap 1" in selected_stage:
        st.session_state.stage = 1
    elif "Tahap 2" in selected_stage:
        if st.session_state.weights is not None:
            st.session_state.stage = 2
        else:
            st.warning("⚠️ Selesaikan perhitungan bobot AHP terlebih dahulu!")
    elif "Tahap 3" in selected_stage:
        if st.session_state.saw_result is not None:
            st.session_state.stage = 3
        else:
            st.warning("⚠️ Jalankan SAW terlebih dahulu!")

    st.markdown("---")
    st.markdown("### ⚡ Detail Sistem")
    st.markdown(f"""
    <div style="font-size: 0.8rem; line-height: 1.6; color: #94A3B8;">
        <b>Engine:</b> AHP Matrix + SAW Calculation<br>
        <b>Database Size:</b> {len(vehicles_df)} alternatif<br>
        <b>Kriteria Evaluasi:</b><br>
        - {get_icon("dollar", 12, "#F59E0B")} Harga (Cost)<br>
        - {get_icon("battery", 12, "#00D97E")} Range (Benefit)<br>
        - {get_icon("zap", 12, "#3B82F6")} Kecepatan (Benefit)<br>
        - {get_icon("cpu", 12, "#06B6D4")} Baterai (Benefit)
    </div>
    """, unsafe_allow_html=True)

# ──────────────────────────────────────────────────────────
# LOADING SCREEN INTERACTION
# ──────────────────────────────────────────────────────────
if st.session_state.show_loading:
    st.markdown(f"""
    <div class="loading-overlay">
        <div class="loading-container">
            <div class="loading-glow-bg"></div>
            <div class="spinner-wrapper">
                <div class="spinner-ring"></div>
                <div class="spinner-ring-inner"></div>
                <div class="spinner-core">
                    <span class="spinner-zap-icon">{get_icon("zap", 24, "#00D97E")}</span>
                </div>
            </div>
            <div class="loading-title">Mengalkulasi Rekomendasi</div>
            <div class="loading-steps-track">
                <div class="loading-steps-progress" style="width: 100%;"></div>
            </div>
            <div class="loading-step-text">Memproses Matriks AHP & Ranking SAW...</div>
            <div class="loading-indicator-strip">
                <div class="dot-pulse"></div>
                <span class="loading-sub-text">EVFINDER ENGINE v1.0</span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    time.sleep(1.5)
    st.session_state.show_loading = False
    st.session_state.stage = 2
    st.rerun()

# ──────────────────────────────────────────────────────────
# STAGE 1: AHP PREFERENCE INPUT
# ──────────────────────────────────────────────────────────
if st.session_state.stage == 1:
    st.markdown('<div class="section-label">Langkah 1</div>', unsafe_allow_html=True)
    st.markdown('<h2>Matriks Perbandingan Berpasangan (AHP)</h2>', unsafe_allow_html=True)
    st.markdown('<p style="margin-bottom: 24px;">Gunakan 6 slider di bawah ini untuk menilai kepentingan relatif antar kriteria (Saaty Scale 1-9).</p>', unsafe_allow_html=True)
    
    # Expandable Guide Panel
    with st.expander(f"❔ Panduan Penggunaan Skala AHP", expanded=True):
        st.markdown(f"""
        <div style="font-size: 0.85rem; line-height: 1.6; color: #94A3B8;">
            <ul>
                <li>Geser ke <b>KIRI</b> untuk memprioritaskan kriteria sebelah kiri.</li>
                <li>Geser ke <b>KANAN</b> untuk memprioritaskan kriteria sebelah kanan.</li>
                <li>Posisikan di <b>TENGAH (Nilai 9)</b> jika kedua kriteria sama penting (Bobot 1:1).</li>
                <li>Semakin jauh dari tengah, kriteria terpilih dinilai semakin penting (Skala Saaty 2 hingga 9).</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    # Preset selection
    st.markdown('<div class="glass-card" style="padding: 16px 20px;">', unsafe_allow_html=True)
    cols = st.columns([1.5, 4.5])
    with cols[0]:
        st.markdown(f'<div style="font-size: 0.72rem; font-weight: 700; margin-top: 8px; color: #475569;">{get_icon("list", 12)} PILIH PRESET PROFIL:</div>', unsafe_allow_html=True)
    with cols[1]:
        # Chips implementation using buttons
        preset_cols = st.columns(5)
        preset_keys = ["equal", "price_first", "range_first", "speed_first", "balanced_ev"]
        preset_labels = ["Sama Penting", "Harga Murah", "Jarak Tempuh", "Performa", "Kompromi EV"]
        
        for idx, key in enumerate(preset_keys):
            with preset_cols[idx]:
                if st.button(
                    preset_labels[idx],
                    key=f"preset_{key}",
                    type="primary" if st.session_state.active_preset == key else "secondary",
                    use_container_width=True
                ):
                    st.session_state.active_preset = key
                    st.session_state.sliders = PRESETS[key]
                    st.rerun()
                    
    st.markdown(f'<div style="margin-top: 10px; font-size: 0.78rem; color: #475569; font-family: monospace;">» {PRESET_DESCRIPTIONS[st.session_state.active_preset]}</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    # Calculate weights and consistency in real time
    ahp_calc = AHPCalculator()
    matrix = np.ones((4, 4))
    
    # Two columns: sliders left, live consistency and preview right
    col_layout = st.columns([1.3, 0.7])
    
    with col_layout[0]:
        st.markdown('### 🎚️ Atur Perbandingan Kriteria')
        
        sliders = st.session_state.sliders.copy()
        
        for idx, (i, j, left_name, right_name, icon_l, icon_r) in enumerate(PAIRS):
            # Render labels
            text_color = "var(--green)" if sliders[idx] < 9 else ("var(--blue)" if sliders[idx] > 9 else "var(--text-muted)")
            st.markdown(f"""
            <div style="display: flex; justify-content: space-between; margin-top: 12px; margin-bottom: 2px;">
                <span style="font-weight: 700; color: #F1F5F9; font-size: 0.85rem;">{get_icon(icon_l, 14, "#00D97E")} {left_name}</span>
                <span style="font-weight: 700; color: #F1F5F9; font-size: 0.85rem;">{right_name} {get_icon(icon_r, 14, "#3B82F6")}</span>
            </div>
            <div style="font-size: 0.8rem; color: {text_color}; margin-bottom: 6px;">
                {get_comparison_text(left_name, right_name, sliders[idx])}
            </div>
            """, unsafe_allow_html=True)
            
            # Slider
            val = st.slider(
                f"slider_widget_{idx}",
                min_value=1,
                max_value=17,
                value=sliders[idx],
                step=1,
                key=f"widget_{idx}",
                label_visibility="collapsed"
            )
            
            if val != sliders[idx]:
                st.session_state.sliders[idx] = val
                st.session_state.active_preset = None
                st.rerun()

    # Build AHP matrix from sliders
    for idx, (i, j, _, _, _, _) in enumerate(PAIRS):
        val = slider_to_ahp(st.session_state.sliders[idx])
        matrix[i, j] = val
        matrix[j, i] = round(1.0 / val, 6)

    # Compute AHP weights
    weights, cr, lambda_max, status = ahp_calc.calculate(matrix)
    is_consistent = cr <= 0.10 if cr is not None else False
    st.session_state.weights = weights
    st.session_state.cr = cr

    with col_layout[1]:
        st.markdown('### 🔍 Validasi Matriks')
        
        box_border_color = "var(--green)" if is_consistent else "var(--red)"
        box_bg_color = "rgba(0, 217, 126, 0.02)" if is_consistent else "rgba(239, 68, 68, 0.02)"
        box_text_color = "var(--green)" if is_consistent else "var(--red)"
        box_icon = get_icon("zap", 16, "#00D97E") if is_consistent else get_icon("help", 16, "#EF4444")
        
        status_title = "Logika Pilihan: Konsisten (Valid)" if is_consistent else "Logika Pilihan: Ada Kontradiksi"
        status_desc = ("Preferensi pilihan Anda sudah logis dan selaras secara matematis. "
                       "Bobot ini valid untuk digunakan dalam pemeringkatan.") if is_consistent else (
                       "Terdapat kontradiksi nilai (misal: A > B, B > C, tetapi C > A). "
                       "Sesuaikan slider agar tidak terlalu ekstrem agar pilihan menjadi rasional.")
                       
        st.markdown(f"""
        <div class="glass-card" style="border-left: 4px solid {box_border_color}; background: {box_bg_color}; padding: 18px;">
            <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: {box_text_color}; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                {box_icon} {status_title}
            </div>
            <div style="font-size: 0.72rem; color: #475569; margin-bottom: 10px; font-family: monospace;">
                Consistency Ratio (CR): <strong style="color: {box_text_color}; font-size: 0.85rem;">{cr*100:.1f}%</strong> (Batas: 10.0%)
            </div>
            <p style="margin: 0; font-size: 0.78rem; color: #94A3B8; line-height: 1.4;">
                {status_desc}
            </p>
        </div>
        """, unsafe_allow_html=True)
        
        # Real-time Weight Preview Panel
        if is_consistent and weights is not None:
            st.markdown('<div class="glass-card glass-card-green">', unsafe_allow_html=True)
            st.markdown('<div class="section-label" style="margin-bottom: 12px;">Bobot Hasil AHP</div>', unsafe_allow_html=True)
            
            c_icons = {"price": "dollar", "range": "battery", "top_speed": "zap", "battery": "cpu"}
            c_names = {"price": "Harga", "range": "Range", "top_speed": "Kecepatan", "battery": "Baterai"}
            c_colors = {"price": "#F59E0B", "range": "#00D97E", "top_speed": "#3B82F6", "battery": "#06B6D4"}
            
            for key, val in weights.items():
                st.markdown(f"""
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px; align-items: center;">
                    <span style="font-weight: 700; color: #F1F5F9; display: flex; align-items: center; gap: 4px;">
                        {get_icon(c_icons[key], 12, c_colors[key])} {c_names[key]}
                    </span>
                    <span class="numeric" style="color: {c_colors[key]};">{val*100:.1f}%</span>
                </div>
                <div style="height: 4px; background: rgba(255,255,255,0.04); margin-bottom: 12px; position: relative;">
                    <div style="height: 100%; background: {c_colors[key]}; width: {val*100}%; box-shadow: 0 0 6px {c_colors[key]};"></div>
                </div>
                """, unsafe_allow_html=True)
            st.markdown('</div>', unsafe_allow_html=True)
            
    # Submit controls
    st.markdown("---")
    if is_consistent:
        cols = st.columns([2.5, 7.5])
        with cols[0]:
            if st.button("🚀 Hitung SAW & Lihat Hasil", type="primary", use_container_width=True):
                trigger_confetti()
                st.session_state.show_loading = True
                st.rerun()
        with cols[1]:
            st.markdown(f"""
            <div style="font-size: 0.72rem; color: #475569; display: flex; align-items: center; gap: 6px; margin-top: 10px; font-weight: 700; text-transform: uppercase;">
                {get_icon("help", 12, "#475569")} Nilai CR Konsisten. Siap melanjutkan ke analisis pemeringkatan SAW.
            </div>
            """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div style="font-size: 0.80rem; color: #EF4444; font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
            {get_icon("help", 14, "#EF4444")} Perhitungan terkunci. Sesuaikan kembali slider di sebelah kiri untuk menyeimbangkan logika perbandingan.
        </div>
        """, unsafe_allow_html=True)

# ──────────────────────────────────────────────────────────
# STAGE 2: SAW RESULTS TABLE
# ──────────────────────────────────────────────────────────
elif st.session_state.stage == 2:
    if st.session_state.weights is None:
        st.error("❌ Silakan selesaikan Tahap 1 terlebih dahulu!")
        st.session_state.stage = 1
        st.rerun()

    st.markdown('<div class="section-label">Langkah 2</div>', unsafe_allow_html=True)
    st.markdown('<h2>Hasil Pemeringkatan Mobil Listrik (SAW)</h2>', unsafe_allow_html=True)
    st.markdown('<p style="margin-bottom: 24px;">Berikut adalah peringkat mobil listrik terbaik berdasarkan bobot kriteria AHP yang Anda tentukan.</p>', unsafe_allow_html=True)
    
    # Calculate SAW
    saw_calc = SAWCalculator(vehicles_df, st.session_state.weights)
    ranking_result = saw_calc.calculate()
    st.session_state.saw_result = ranking_result

    # Display Top 10 using beautiful HTML custom table
    st.markdown("### 🏆 Top 10 Mobil Listrik Terbaik")
    
    def generate_table_html(df):
        html = """
        <div class="table-responsive">
            <table class="results-table">
                <thead>
                    <tr>
                        <th style="width: 100px;">Peringkat</th>
                        <th>Nama Mobil</th>
                        <th>Harga (EUR)</th>
                        <th>Range (km)</th>
                        <th>Kecepatan (km/h)</th>
                        <th>Baterai (kWh)</th>
                        <th style="width: 140px;">Skor SAW</th>
                    </tr>
                </thead>
                <tbody>
        """
        for idx, row in df.iterrows():
            rank = idx + 1
            rank_style = ""
            if rank == 1:
                rank_style = "color: #F59E0B; font-weight: 800;"
                rank_val = f"🥇 {rank}"
            elif rank == 2:
                rank_style = "color: #94A3B8; font-weight: 800;"
                rank_val = f"🥈 {rank}"
            elif rank == 3:
                rank_style = "color: #CD7C2B; font-weight: 800;"
                rank_val = f"🥉 {rank}"
            else:
                rank_val = str(rank)
                
            html += f"""
                    <tr class="table-row-hover">
                        <td style="{rank_style}">{rank_val}</td>
                        <td style="font-weight: 700; color: #F1F5F9;">{row['name']}</td>
                        <td class="numeric">€{row['price']:,.0f}</td>
                        <td class="numeric">{row['range']} km</td>
                        <td class="numeric">{row['top_speed']} km/h</td>
                        <td class="numeric">{row['battery']} kWh</td>
                        <td><span class="table-score-badge">{row['score']:.4f}</span></td>
                    </tr>
            """
        html += """
                </tbody>
            </table>
        </div>
        """
        return html

    st.markdown(generate_table_html(ranking_result.head(10)), unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Search & Filter
    st.markdown("### 🔎 Cari Mobil")
    search_term = st.text_input("Cari berdasarkan nama mobil listrik:", "", placeholder="Ketik nama mobil (misal: Tesla, Ioniq, ID.4...)")
    if search_term:
        filtered = ranking_result[ranking_result['name'].str.contains(search_term, case=False)]
        if len(filtered) > 0:
            st.markdown(generate_table_html(filtered.head(10)), unsafe_allow_html=True)
        else:
            st.info("Mobil tidak ditemukan dalam database.")

    # Controls
    st.markdown("---")
    cols = st.columns([1.5, 1.5, 7])
    with cols[0]:
        if st.button("⏮️ Kembali ke AHP", type="secondary", use_container_width=True):
            st.session_state.stage = 1
            st.rerun()
    with cols[1]:
        if st.button("📈 Lihat Visualisasi", type="primary", use_container_width=True):
            st.session_state.stage = 3
            st.rerun()

# ──────────────────────────────────────────────────────────
# STAGE 3: VISUALIZATIONS & DETAILED STATS
# ──────────────────────────────────────────────────────────
elif st.session_state.stage == 3:
    if st.session_state.saw_result is None:
        st.error("❌ Silakan selesaikan Tahap 2 terlebih dahulu!")
        st.session_state.stage = 2
        st.rerun()

    st.markdown('<div class="section-label">Langkah 3</div>', unsafe_allow_html=True)
    st.markdown('<h2>Visualisasi Hasil & Statistik</h2>', unsafe_allow_html=True)
    st.markdown('<p style="margin-bottom: 24px;">Analisis mendalam perbandingan skor dan profil spesifikasi antar alternatif teratas.</p>', unsafe_allow_html=True)
    
    ranking_result = st.session_state.saw_result
    top_10 = ranking_result.head(10)

    # Bar chart for Top 10
    st.markdown("### 📊 Perbandingan Skor SAW (Top 10)")
    
    fig_bar = go.Figure(data=[
        go.Bar(
            x=top_10['name'],
            y=top_10['score'],
            marker=dict(
                color=top_10['score'],
                colorscale=[[0, '#3B82F6'], [1, '#00D97E']],
                showscale=False
            ),
            text=top_10['score'].round(4),
            textposition='auto',
        )
    ])
    
    fig_bar.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font_color="#94A3B8",
        font_family="Segoe UI, sans-serif",
        xaxis=dict(
            gridcolor="rgba(255,255,255,0.05)", 
            linecolor="rgba(255,255,255,0.1)",
            tickangle=-30
        ),
        yaxis=dict(gridcolor="rgba(255,255,255,0.05)", linecolor="rgba(255,255,255,0.1)"),
        height=400,
        margin=dict(l=40, r=40, t=20, b=80)
    )
    
    st.plotly_chart(fig_bar, use_container_width=True)

    st.markdown("---")

    # Radar Chart for Top 3
    st.markdown("### 🎯 Profil Perbandingan Spesifikasi (Top 3)")
    
    top_3 = ranking_result.head(3)
    normalized_data = []
    
    # Max/min values for normalisation
    p_min, p_max = vehicles_df['price'].min(), vehicles_df['price'].max()
    r_min, r_max = vehicles_df['range'].min(), vehicles_df['range'].max()
    s_min, s_max = vehicles_df['top_speed'].min(), vehicles_df['top_speed'].max()
    b_min, b_max = vehicles_df['battery'].min(), vehicles_df['battery'].max()
    
    for _, row in top_3.iterrows():
        # Price is cost (lower is better, so invert normalized score)
        norm_price = (p_max - row['price']) / (p_max - p_min) if p_max != p_min else 1.0
        norm_range = (row['range'] - r_min) / (r_max - r_min) if r_max != r_min else 1.0
        norm_speed = (row['top_speed'] - s_min) / (s_max - s_min) if s_max != s_min else 1.0
        norm_battery = (row['battery'] - b_min) / (b_max - b_min) if b_max != b_min else 1.0
        
        normalized_data.append({
            'name': row['name'],
            'Harga': norm_price,
            'Range': norm_range,
            'Kecepatan': norm_speed,
            'Baterai': norm_battery
        })
    
    fig_radar = go.Figure()
    colors = ["#F59E0B", "#3B82F6", "#00D97E"]
    
    for idx, data in enumerate(normalized_data):
        fig_radar.add_trace(go.Scatterpolar(
            r=[data['Harga'], data['Range'], data['Kecepatan'], data['Baterai']],
            theta=['Harga', 'Range', 'Kecepatan', 'Baterai'],
            fill='toself',
            name=data['name'],
            line=dict(color=colors[idx]),
        ))
    
    fig_radar.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        polar=dict(
            bgcolor="rgba(0,0,0,0)",
            radialaxis=dict(
                visible=True, 
                range=[0, 1], 
                gridcolor="rgba(255,255,255,0.06)", 
                linecolor="rgba(255,255,255,0.1)",
                tickfont=dict(color="rgba(255,255,255,0.4)")
            ),
            angularaxis=dict(
                gridcolor="rgba(255,255,255,0.06)", 
                linecolor="rgba(255,255,255,0.1)"
            )
        ),
        font_color="#94A3B8",
        font_family="Segoe UI, sans-serif",
        height=500,
        margin=dict(l=60, r=60, t=40, b=40)
    )
    
    st.plotly_chart(fig_radar, use_container_width=True)

    st.markdown("---")

    # Detailed Stats Summary Cards
    st.markdown("### 📈 Ringkasan Keputusan")
    
    cols = st.columns(4)
    with cols[0]:
        st.metric("🥇 Rekomendasi Utama", top_10.iloc[0]['name'])
    with cols[1]:
        st.metric("Skor Tertinggi", f"{top_10.iloc[0]['score']:.4f}")
    with cols[2]:
        st.metric("Skor Alternatif 10", f"{top_10.iloc[9]['score']:.4f}")
    with cols[3]:
        st.metric("Total Pilihan Mobil", f"{len(ranking_result)}")

    st.markdown("---")
    
    # Navigation Buttons
    cols = st.columns([1.5, 1.5, 7])
    with cols[0]:
        if st.button("⏮️ Kembali ke Hasil", type="secondary", use_container_width=True):
            st.session_state.stage = 2
            st.rerun()
    with cols[1]:
        if st.button("🔄 Mulai Dari Awal", type="primary", use_container_width=True):
            st.session_state.stage = 1
            st.session_state.weights = None
            st.session_state.cr = None
            st.session_state.saw_result = None
            st.session_state.sliders = [9, 9, 9, 9, 9, 9]
            st.session_state.active_preset = "equal"
            st.rerun()

# ──────────────────────────────────────────────────────────
# FOOTER SECTION
# ──────────────────────────────────────────────────────────
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #475569; font-size: 11px; margin-top: 20px; font-weight: 700; text-transform: uppercase;'>
    SPK Pemilihan Mobil Listrik | Metode AHP + SAW | Developed with Streamlit & Plotly
</div>
""", unsafe_allow_html=True)
