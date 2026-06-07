import streamlit as st
import pandas as pd
import numpy as np
from saw_engine import SAWCalculator
from ahp_engine import AHPCalculator
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime
import time

# Page config
st.set_page_config(
    page_title="SPK Pemilihan Mobil Listrik",
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
        "help": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
        "sliders": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
        "search": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        "award": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
        "trending-up": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        "target": f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'
    }
    return icons.get(icon_name, "")

# Helper to render clean HTML strings and prevent markdown codeblock rendering issues
def render_html(html_str):
    cleaned = "\n".join([line.strip() for line in html_str.split("\n")])
    st.markdown(cleaned, unsafe_allow_html=True)

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

    /* Adjust sidebar labels */
    div[data-testid="stSidebar"] div[data-testid="stWidgetLabel"] p {{
      font-size: 0.72rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.1em !important;
      color: #475569 !important;
      font-weight: 800 !important;
      margin-bottom: 8px !important;
    }}

    /* Sidebar primary button override (Black theme) */
    div[data-testid="stSidebar"] div.stButton > button[kind="primary"] {{
      background: #000000 !important;
      color: #FFFFFF !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
    }}
    div[data-testid="stSidebar"] div.stButton > button[kind="primary"]:hover {{
      background: #111111 !important;
      color: #FFFFFF !important;
      border-color: rgba(255, 255, 255, 0.4) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
      transform: translateY(-1px) !important;
    }}

    /* Responsive styling for Mobile */
    @media (max-width: 768px) {{
      .site-header {{
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 12px !important;
        padding: 15px 20px !important;
      }}
      .site-logo {{
        font-size: 1rem !important;
      }}
      .step-tabs {{
        flex-direction: column !important;
      }}
      .step-tab {{
        padding: 12px 16px !important;
        border-bottom: none !important;
        border-left: 2px solid transparent !important;
        justify-content: flex-start !important;
      }}
      .step-tab.active {{
        border-left: 2px solid #00D97E !important;
        background: rgba(0, 217, 126, 0.03) !important;
      }}
      .glass-card {{
        padding: 16px !important;
      }}
    }}
</style>
""", unsafe_allow_html=True)

# Initialize session state variables
if "stage" not in st.session_state:
    st.session_state.stage = 1
    st.session_state.weights = None
    st.session_state.saw_result = None
    st.session_state.show_loading = False

# Preset selector state
if "active_preset" not in st.session_state:
    st.session_state.active_preset = "equal"

# Preset Profiles Mapping for Guided AHP (4 sliders: ahp_s1, ahp_s2, ahp_s3, ahp_s4)
PRESETS = {
    "equal": [0, 0, 0, 0],
    "price_first": [-4, 0, 0, -4],
    "range_first": [4, -4, 0, 0],
    "speed_first": [0, 4, -4, 0],
    "balanced_ev": [-1, 0, 0, -1],
}

PRESET_DESCRIPTIONS = {
    "equal": "Semua kriteria memiliki bobot kepentingan sama (25.0%).",
    "price_first": "Prioritas utama pada aspek anggaran/harga murah (Harga: 62.5%, lainnya: 12.5%).",
    "range_first": "Prioritas pada efisiensi daya dan jarak tempuh terjauh (Range: 62.5%, lainnya: 12.5%).",
    "speed_first": "Prioritas pada tenaga mesin dan kecepatan tinggi (Kecepatan: 62.5%, lainnya: 12.5%).",
    "balanced_ev": "Kompromi optimal dengan mengutamakan sedikit aspek harga (Harga: 40.0%, lainnya: 20.0%).",
}

# Guided AHP sliders session state
if "ahp_s1" not in st.session_state:
    st.session_state.ahp_s1 = 0
if "ahp_s2" not in st.session_state:
    st.session_state.ahp_s2 = 0
if "ahp_s3" not in st.session_state:
    st.session_state.ahp_s3 = 0
if "ahp_s4" not in st.session_state:
    st.session_state.ahp_s4 = 0

def map_slider_to_ahp(val):
    if val < 0:
        return abs(val) + 1
    elif val > 0:
        return 1 / (val + 1)
    else:
        return 1.0

def build_guided_matrix(v1, v2, v3, v4):
    matrix = np.ones((4, 4))
    
    matrix[0, 1] = map_slider_to_ahp(v1)
    matrix[1, 0] = 1 / matrix[0, 1]
    
    matrix[1, 2] = map_slider_to_ahp(v2)
    matrix[2, 1] = 1 / matrix[1, 2]
    
    matrix[2, 3] = map_slider_to_ahp(v3)
    matrix[3, 2] = 1 / matrix[2, 3]
    
    matrix[0, 3] = map_slider_to_ahp(v4)
    matrix[3, 0] = 1 / matrix[0, 3]
    
    matrix[0, 2] = matrix[0, 1] * matrix[1, 2]
    matrix[2, 0] = 1 / matrix[0, 2]
    
    matrix[1, 3] = matrix[1, 2] * matrix[2, 3]
    matrix[3, 1] = 1 / matrix[1, 3]
    
    return matrix

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
            <span class="step-num">1</span> Input Preferensi Bobot
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
    st.markdown("### Navigasi Cepat")
    
    st.markdown('<div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;">', unsafe_allow_html=True)
    if st.button("Tahap 1: Atur Bobot (AHP)", type="secondary" if st.session_state.stage != 1 else "primary", use_container_width=True):
        st.session_state.stage = 1
        st.rerun()
    
    if st.button("Tahap 2: Hasil Ranking (SAW)", type="secondary" if st.session_state.stage != 2 else "primary", use_container_width=True):
        if st.session_state.weights is not None:
            st.session_state.stage = 2
            st.rerun()
        else:
            st.warning("Selesaikan pengaturan bobot terlebih dahulu!")
            
    if st.button("Tahap 3: Visualisasi", type="secondary" if st.session_state.stage != 3 else "primary", use_container_width=True):
        if st.session_state.saw_result is not None:
            st.session_state.stage = 3
            st.rerun()
        else:
            st.warning("Jalankan SAW terlebih dahulu!")
    st.markdown('</div>', unsafe_allow_html=True)

    st.markdown("---")
    with st.expander("Panduan & Cara Kerja", expanded=False):
        st.markdown("""
        <div style="font-size: 0.8rem; color: #94A3B8; line-height: 1.5;">
            <strong>Sistem Pendukung Keputusan (SPK) Mobil Listrik</strong> ini menggunakan 2 metode:<br><br>
            <strong>1. AHP Terpandu</strong><br>
            Menentukan <strong>Bobot Prioritas</strong> kriteria. Anda cukup membandingkan 3 pasang kriteria utama, lalu sistem menghitung sisanya secara otomatis agar logika perbandingan Anda 100% konsisten (CR = 0%).<br><br>
            <strong>2. SAW</strong><br>
            Melakukan <strong>Perankingan</strong>. Menormalisasi database mobil listrik dan mengalikannya dengan bobot AHP Anda untuk mendapatkan Skor Akhir terbaik.
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("### Detail Sistem")
    render_html(f"""
    <div style="font-size: 0.8rem; line-height: 1.6; color: #94A3B8;">
        <b>Engine:</b> SAW Calculation (Simple Additive Weighting)<br>
        <b>Database Size:</b> {len(vehicles_df)} alternatif<br>
        <b>Kriteria Evaluasi:</b><br>
        - {get_icon("dollar", 12, "#F59E0B")} Harga (Cost)<br>
        - {get_icon("battery", 12, "#00D97E")} Range (Benefit)<br>
        - {get_icon("zap", 12, "#3B82F6")} Kecepatan (Benefit)<br>
        - {get_icon("cpu", 12, "#06B6D4")} Baterai (Benefit)
    </div>
    """)

# ──────────────────────────────────────────────────────────
# LOADING SCREEN INTERACTION
# ──────────────────────────────────────────────────────────
if st.session_state.show_loading:
    render_html(f"""
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
    """)
    time.sleep(1.5)
    st.session_state.show_loading = False
    st.session_state.stage = 2
    st.rerun()

# ──────────────────────────────────────────────────────────
# STAGE 1: GUIDED AHP INPUT
# ──────────────────────────────────────────────────────────
if st.session_state.stage == 1:
    st.markdown('<div class="section-label">Langkah 1</div>', unsafe_allow_html=True)
    st.markdown('<h2>AHP Terpandu (Guided AHP)</h2>', unsafe_allow_html=True)
    st.markdown('<p style="margin-bottom: 24px;">Bandingkan kepentingan kriteria di bawah ini secara berpasangan. Sistem AHP Terpandu kami akan otomatis menghitung 3 perbandingan sisanya untuk memastikan logika Anda 100% konsisten sempurna secara matematis (CR = 0.0%).</p>', unsafe_allow_html=True)

    # Preset Profil Selector
    st.markdown(f'<div style="font-size: 0.72rem; font-weight: 700; margin-top: 8px; color: #475569; text-transform: uppercase;">{get_icon("list", 12, "#475569")}&nbsp; PILIH PRESET PROFIL:</div>', unsafe_allow_html=True)
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
                st.session_state.ahp_s1 = PRESETS[key][0]
                st.session_state.ahp_s2 = PRESETS[key][1]
                st.session_state.ahp_s3 = PRESETS[key][2]
                st.session_state.ahp_s4 = PRESETS[key][3]
                st.rerun()
                
    preset_desc = PRESET_DESCRIPTIONS.get(st.session_state.active_preset, "Kustom (Matriks perbandingan disesuaikan secara manual).")
    st.markdown(f'<div style="margin-top: 10px; margin-bottom: 25px; font-size: 0.78rem; color: #475569; font-family: monospace;">» {preset_desc}</div>', unsafe_allow_html=True)

    col_layout = st.columns([1.3, 0.7])
    
    with col_layout[0]:
        st.markdown(f'<h3>{get_icon("sliders", 18, "#F1F5F9")}&nbsp; Perbandingan Pasangan Kriteria Utama</h3>', unsafe_allow_html=True)
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        
        def format_slider_label(val, left_label, right_label):
            if val < 0:
                return f"{left_label} {abs(val) + 1}x lebih penting dari {right_label}"
            elif val > 0:
                return f"{right_label} {val + 1}x lebih penting dari {left_label}"
            else:
                return f"{left_label} & {right_label} sama penting"
                
        # Slider 1
        st.markdown(f'<div style="font-weight: 700; color: #F59E0B;">{get_icon("dollar", 14)} Harga vs {get_icon("battery", 14)} Range</div>', unsafe_allow_html=True)
        v1 = st.slider("Harga vs Range", -4, 4, st.session_state.ahp_s1, 1, key="slider_1", label_visibility="collapsed")
        st.markdown(f'<div style="font-size: 0.75rem; color: #94A3B8; text-align: center; margin-bottom: 20px;">{format_slider_label(v1, "Harga", "Range")}</div>', unsafe_allow_html=True)

        # Slider 2
        st.markdown(f'<div style="font-weight: 700; color: #00D97E;">{get_icon("battery", 14)} Range vs {get_icon("zap", 14)} Kecepatan</div>', unsafe_allow_html=True)
        v2 = st.slider("Range vs Kecepatan", -4, 4, st.session_state.ahp_s2, 1, key="slider_2", label_visibility="collapsed")
        st.markdown(f'<div style="font-size: 0.75rem; color: #94A3B8; text-align: center; margin-bottom: 20px;">{format_slider_label(v2, "Range", "Kecepatan")}</div>', unsafe_allow_html=True)

        # Slider 3
        st.markdown(f'<div style="font-weight: 700; color: #3B82F6;">{get_icon("zap", 14)} Kecepatan vs {get_icon("cpu", 14)} Baterai</div>', unsafe_allow_html=True)
        v3 = st.slider("Kecepatan vs Baterai", -4, 4, st.session_state.ahp_s3, 1, key="slider_3", label_visibility="collapsed")
        st.markdown(f'<div style="font-size: 0.75rem; color: #94A3B8; text-align: center; margin-bottom: 20px;">{format_slider_label(v3, "Kecepatan", "Baterai")}</div>', unsafe_allow_html=True)

        # Slider 4
        st.markdown(f'<div style="font-weight: 700; color: #EAB308;">{get_icon("dollar", 14)} Harga vs {get_icon("cpu", 14)} Baterai</div>', unsafe_allow_html=True)
        v4 = st.slider("Harga vs Baterai", -4, 4, st.session_state.ahp_s4, 1, key="slider_4", label_visibility="collapsed")
        st.markdown(f'<div style="font-size: 0.75rem; color: #94A3B8; text-align: center;">{format_slider_label(v4, "Harga", "Baterai")}</div>', unsafe_allow_html=True)

        # Detect manual slider movement
        if (v1 != st.session_state.ahp_s1) or (v2 != st.session_state.ahp_s2) or (v3 != st.session_state.ahp_s3) or (v4 != st.session_state.ahp_s4):
            st.session_state.ahp_s1 = v1
            st.session_state.ahp_s2 = v2
            st.session_state.ahp_s3 = v3
            st.session_state.ahp_s4 = v4
            st.session_state.active_preset = "custom"
            st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)

    with col_layout[1]:
        st.markdown(f'<h3>{get_icon("list", 18, "#F1F5F9")}&nbsp; Validasi Matriks</h3>', unsafe_allow_html=True)
        
        # Calculate AHP Matrix and Weights
        matrix = build_guided_matrix(v1, v2, v3, v4)
        
        if matrix.max() > 9.01:
            st.markdown('<div style="padding: 10px; background-color: rgba(239, 68, 68, 0.1); border: 1px solid #EF4444; border-radius: 5px; color: #EF4444; font-size: 0.8rem; margin-bottom: 15px;">Warning: Terdapat nilai turunan matriks yang melebihi batas skala Saaty (>9). Pertimbangkan penyesuaian slider.</div>', unsafe_allow_html=True)
            
        ahp = AHPCalculator()
        weights_arr, cr, lambda_max, msg = ahp.calculate(matrix)
        
        if weights_arr is not None:
            weights_dict = {
                'price': weights_arr[0],
                'range': weights_arr[1],
                'top_speed': weights_arr[2],
                'battery': weights_arr[3]
            }
            st.session_state.weights = weights_dict
        else:
            weights_dict = None
            
        # UI for Matrix Validity
        cr_percent = cr * 100
        cr_status = "Konsisten" if cr <= 0.10 else "Tidak Konsisten"
        cr_color = "var(--green)" if cr <= 0.10 else "#EF4444"
        cr_icon = "zap" if cr <= 0.10 else "help" # using existing icon
        cr_msg = "Logika Anda masuk akal matematis." if cr <= 0.10 else "Matriks tidak konsisten! Sesuaikan ulang slider."
        
        render_html(f"""
        <div class="glass-card" style="margin-bottom: 20px;">
            <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: {cr_color}; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                {get_icon(cr_icon, 16, cr_color)} {cr_status}
            </div>
            <div style="font-size: 0.72rem; color: #475569; margin-bottom: 10px; font-family: monospace;">
                Consistency Ratio (CR): <strong style="color: {cr_color}; font-size: 0.85rem;">{cr_percent:.1f}%</strong> (Batas: 10.0%)
            </div>
            <p style="margin: 0; font-size: 0.78rem; color: #94A3B8; line-height: 1.4;">
                {cr_msg}
            </p>
        </div>
        """)
        
        if weights_dict is not None:
            st.markdown('<div class="glass-card glass-card-green">', unsafe_allow_html=True)
            st.markdown('<div class="section-label" style="margin-bottom: 12px;">Bobot Hasil AHP</div>', unsafe_allow_html=True)
            
            c_icons = {"price": "dollar", "range": "battery", "top_speed": "zap", "battery": "cpu"}
            c_names = {"price": "Harga", "range": "Range", "top_speed": "Kecepatan", "battery": "Baterai"}
            c_colors = {"price": "#F59E0B", "range": "#00D97E", "top_speed": "#3B82F6", "battery": "#06B6D4"}
            
            for key, val in weights_dict.items():
                render_html(f"""
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px; align-items: center;">
                    <span style="font-weight: 700; color: #F1F5F9; display: flex; align-items: center; gap: 4px;">
                        {get_icon(c_icons[key], 12, c_colors[key])} {c_names[key]}
                    </span>
                    <span class="numeric" style="color: {c_colors[key]};">{val*100:.1f}%</span>
                </div>
                <div style="height: 4px; background: rgba(255,255,255,0.04); margin-bottom: 12px; position: relative;">
                    <div style="height: 100%; background: {c_colors[key]}; width: {val*100}%; box-shadow: 0 0 6px {c_colors[key]};"></div>
                </div>
                """)
            st.markdown('</div>', unsafe_allow_html=True)

    # Submit controls
    st.markdown("---")
    cols = st.columns([2.5, 7.5])
    with cols[0]:
        if cr > 0.10:
            st.markdown('<div style="padding: 10px; background-color: rgba(239, 68, 68, 0.1); border-radius: 5px; color: #EF4444; font-size: 0.8rem; margin-bottom: 10px;">Nilai CR > 10%. Silakan perbaiki slider Anda terlebih dahulu.</div>', unsafe_allow_html=True)
            st.button("Hitung SAW & Lihat Hasil", type="primary", use_container_width=True, key="submit_direct_weights_disabled", disabled=True)
        else:
            if st.button("Hitung SAW & Lihat Hasil", type="primary", use_container_width=True, key="submit_direct_weights"):
                trigger_confetti()
                st.session_state.show_loading = True
                st.rerun()
    with cols[1]:
        render_html(f"""
        <div style="font-size: 0.72rem; color: #475569; display: flex; align-items: center; gap: 6px; margin-top: 10px; font-weight: 700; text-transform: uppercase;">
            {get_icon("zap", 12, "#475569")} Bobot preferensi tersimpan. Tekan tombol untuk mengalkulasi rekomendasi mobil listrik terbaik Anda.
        </div>
        """)

# ──────────────────────────────────────────────────────────
# STAGE 2: SAW RESULTS TABLE
# ──────────────────────────────────────────────────────────
elif st.session_state.stage == 2:
    if st.session_state.weights is None:
        st.error("Silakan selesaikan Tahap 1 terlebih dahulu!")
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
    st.markdown('<h3>Top 10 Mobil Listrik Terbaik</h3>', unsafe_allow_html=True)
    
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
                rank_val = f"#{rank}"
            elif rank == 2:
                rank_style = "color: #94A3B8; font-weight: 800;"
                rank_val = f"#{rank}"
            elif rank == 3:
                rank_style = "color: #CD7C2B; font-weight: 800;"
                rank_val = f"#{rank}"
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
        cleaned_html = "\n".join([line.strip() for line in html.split("\n")])
        return cleaned_html

    st.markdown(generate_table_html(ranking_result.head(10)), unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Search & Filter
    st.markdown('<h3>Cari Mobil</h3>', unsafe_allow_html=True)
    search_term = st.text_input("Cari berdasarkan nama mobil listrik:", "", placeholder="Ketik nama mobil (misal: Tesla, Ioniq, ID.4...)")
    if search_term:
        filtered = ranking_result[ranking_result['name'].str.contains(search_term, case=False)]
        if len(filtered) > 0:
            st.markdown(generate_table_html(filtered.head(10)), unsafe_allow_html=True)
        else:
            st.markdown('<div style="padding:10px; background-color: rgba(255,255,255,0.05); color: #cbd5e1; border-radius: 5px;">Mobil tidak ditemukan dalam database.</div>', unsafe_allow_html=True)

    # Controls
    st.markdown("---")
    cols = st.columns([1.5, 1.5, 7])
    with cols[0]:
        if st.button("Kembali ke AHP", type="secondary", use_container_width=True):
            st.session_state.stage = 1
            st.rerun()
    with cols[1]:
        if st.button("Lihat Visualisasi", type="primary", use_container_width=True):
            st.session_state.stage = 3
            st.rerun()

# ──────────────────────────────────────────────────────────
# STAGE 3: VISUALIZATIONS & DETAILED STATS
# ──────────────────────────────────────────────────────────
elif st.session_state.stage == 3:
    if st.session_state.saw_result is None:
        st.error("Silakan selesaikan Tahap 2 terlebih dahulu!")
        st.session_state.stage = 2
        st.rerun()

    st.markdown('<div class="section-label">Langkah 3</div>', unsafe_allow_html=True)
    st.markdown('<h2>Visualisasi Hasil & Statistik</h2>', unsafe_allow_html=True)
    st.markdown('<p style="margin-bottom: 24px;">Analisis mendalam perbandingan skor dan profil spesifikasi antar alternatif teratas.</p>', unsafe_allow_html=True)
    
    ranking_result = st.session_state.saw_result
    top_10 = ranking_result.head(10)

    # Bar chart for Top 10
    st.markdown('<h3>Perbandingan Skor SAW (Top 10)</h3>', unsafe_allow_html=True)
    
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
    st.markdown('<h3>Profil Perbandingan Spesifikasi (Top 3)</h3>', unsafe_allow_html=True)
    
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
    st.markdown('<h3>Ringkasan Keputusan</h3>', unsafe_allow_html=True)
    
    cols = st.columns(4)
    with cols[0]:
        st.metric("Rekomendasi Utama", top_10.iloc[0]['name'])
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
        if st.button("Kembali ke Hasil", type="secondary", use_container_width=True):
            st.session_state.stage = 2
            st.rerun()
    with cols[1]:
        if st.button("Mulai Dari Awal", type="primary", use_container_width=True):
            st.session_state.stage = 1
            st.session_state.weights = None
            st.session_state.saw_result = None
            st.session_state.ahp_s1 = 0
            st.session_state.ahp_s2 = 0
            st.session_state.ahp_s3 = 0
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
