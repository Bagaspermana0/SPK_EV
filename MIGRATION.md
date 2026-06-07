# SPK Pemilihan Mobil Listrik — Migrasi ke Streamlit

**Panduan Lengkap Mengubah Project dari React + Flask + PostgreSQL menjadi Streamlit All-in-One**

---

## 📑 Daftar Isi

1. [Ringkasan Perubahan](#ringkasan-perubahan)
2. [Alasan Migrasi](#alasan-migrasi)
3. [Persiapan](#persiapan)
4. [Instalasi & Setup](#instalasi--setup)
5. [Struktur Folder](#struktur-folder)
6. [Kode Implementasi](#kode-implementasi)
7. [Testing & Deployment](#testing--deployment)
8. [Troubleshooting](#troubleshooting)

---

## 📊 Ringkasan Perubahan

### Sebelum (React + Flask + PostgreSQL):
```
├── frontend/          (React + Vite + Chart.js)
├── backend/           (Flask + NumPy + pandas)
├── database/          (PostgreSQL)
└── docs/              (Dokumentasi)
```

### Sesudah (Streamlit):
```
├── app.py             (Main application)
├── ahp_engine.py      (AHP calculator)
├── saw_engine.py      (SAW calculator)
├── vehicles.csv       (Dataset)
├── requirements.txt   (Dependencies)
└── README.md          (Dokumentasi)
```

---

## ✅ Alasan Migrasi

| Aspek | React + Flask | Streamlit |
|-------|---------------|-----------|
| **Kompleksitas** | Tinggi (3 layer terpisah) | Rendah (1 file Python) |
| **Setup Time** | ~2 jam | ~10 menit |
| **Maintenance** | Sulit (frontend-backend sync) | Mudah (satu codebase) |
| **Deployment** | Vercel + Heroku + PostgreSQL | Streamlit Cloud (1 klik) |
| **Focus** | Infrastruktur | Algoritma & Logic |
| **Cocok untuk** | Prototype, Research, MVP | Production-grade app |

**Kesimpulan:** Untuk keperluan skripsi/research, Streamlit lebih efisien karena fokus pada logic bukan infrastructure.

---

## 🛠️ Persiapan

### 1. Clone Project GitHub Kamu

```bash
git clone https://github.com/Bagaspermana0/SPK_EV.git
cd SPK_EV
```

### 2. Cek Struktur Existing

```bash
tree -L 2
```

### 3. Backup Project Lama (Optional)

```bash
git checkout -b old-version-react-flask
git push origin old-version-react-flask
```

### 4. Kembali ke Main & Siapkan untuk Streamlit

```bash
git checkout main
```

---

## 💻 Instalasi & Setup

### Step 1: Install Python 3.8+

```bash
python --version
```

### Step 2: Buat Virtual Environment

```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Verifikasi Instalasi

```bash
streamlit --version
python -c "import pandas, numpy, plotly; print('✅ All imports OK')"
```

---

## 📁 Struktur Folder

Reorganisir project kamu seperti ini:

```
SPK_EV/
│
├── app.py                 # Main Streamlit application
├── ahp_engine.py          # AHP (Analytical Hierarchy Process)
├── saw_engine.py          # SAW (Simple Additive Weighting)
├── vehicles.csv           # Dataset 282 mobil listrik
├── requirements.txt       # Python dependencies
│
├── .gitignore             # Git ignore file
├── README.md              # Main documentation
├── MIGRATION.md           # Dokumentasi migrasi ini
│
├── old_code/              # (Optional) Simpan kode lama
│   ├── frontend/          # React app lama
│   ├── backend/           # Flask app lama
│   └── db/                # Database schema lama
│
└── .streamlit/            # (Auto-generated) Streamlit config
    └── config.toml
```

---

## 🚀 Testing & Deployment

### Local Testing

```bash
streamlit run app.py
```

### Deployment ke Streamlit Cloud (GRATIS)

1. Push ke GitHub
2. Sign Up Streamlit Cloud
3. Deploy dari repository

---

## 📝 Dokumentasi Teknis untuk Skripsi

### Perubahan Arsitektur

**Keuntungan:**
- Lebih sederhana (1 file vs 3 layer terpisah)
- Lebih cepat di-develop (tidak perlu API endpoint)
- Lebih mudah di-maintain (satu codebase)
- Deploy lebih gampang (1 klik di Streamlit Cloud)
