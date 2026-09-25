# 🛡️ ScamShield

### URL & Message Security Analyzer

ScamShield is a full-stack security analysis tool that helps users investigate potentially malicious URLs and suspicious messages using multiple security checks and external threat-intelligence services.

## 🌐 Live Demo

**[Launch ScamShield](https://scam-shield-dun-two.vercel.app/)**

## ✨ Features

- 🔗 URL Security Analysis
- 💬 Suspicious Message Analysis
- 🛡️ VirusTotal Integration
- 🔍 urlscan.io Integration
- 🌐 DNS Analysis
- 📅 Domain Age & WHOIS Information
- 🔐 HTTPS & TLS Certificate Checks
- ↪️ HTTP Redirect Analysis
- 🎯 Brand Impersonation Detection
- 📊 Detailed Risk & Evidence Results
- 🧩 URL Structure Analysis
- 🛡️ SSRF & URL Safety Protection
- 📝 Scan History
- ⚡ FastAPI Backend
- 🎨 Modern React Interface

## 🧠 How It Works

ScamShield analyzes a submitted URL or message through multiple security layers.

For URL analysis, it can examine:

- URL structure
- Domain information
- DNS records
- Domain age
- TLS/HTTPS configuration
- Redirect chains
- Brand impersonation indicators
- External threat intelligence

For message analysis, ScamShield checks for suspicious patterns and common indicators associated with scam and phishing messages.

The collected evidence is then processed and presented through a structured security results interface.

## 🧰 Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- Lucide Icons

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- SQLite

### Security & Intelligence

- VirusTotal API
- urlscan.io API
- DNS
- WHOIS
- TLS / HTTPS
- HTTP Redirect Analysis

### Deployment

- Vercel
- Render
- GitHub

## 📁 Project Structure

```text
ScamShield/
│
├── backend/
│   ├── analyzers/
│   │   ├── brand_analyzer.py
│   │   ├── domain_analyzer.py
│   │   ├── message_analyzer.py
│   │   ├── redirect_analyzer.py
│   │   ├── tls_analyzer.py
│   │   └── url_analyzer.py
│   │
│   ├── integrations/
│   │   ├── urlscan.py
│   │   └── virustotal.py
│   │
│   ├── models/
│   ├── risk/
│   ├── routes/
│   ├── schemas/
│   ├── security/
│   ├── tests/
│   ├── config.py
│   ├── database.py
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .env.example
├── .gitignore
└── README.md


