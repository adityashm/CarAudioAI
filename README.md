# CarAudioAI - AI-Powered Car Audio Tuning App 🚗🔊

> Professional-grade car audio tuning powered by AI, built for the Indian market

[![Platform](https://img.shields.io/badge/Platform-Android-green.svg)](https://www.android.com/)
[![Framework](https://img.shields.io/badge/Framework-React_Native-blue.svg)](https://reactnative.dev/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Language](https://img.shields.io/badge/Language-Hindi%20%2B%20English-orange.svg)](https://www.i18next.com/)

## 📱 What is CarAudioAI?

CarAudioAI is a mobile application that brings professional car audio tuning to enthusiasts across India. Using your smartphone's microphone and AI-powered algorithms, the app:

- **Detects** your car and audio equipment specifications
- **Measures** your system's frequency response in real-time
- **Generates** professional DSP tuning recommendations
- **Exports** ready-to-use configuration files for popular DSP units

**Target Market**: Car audio enthusiasts in Delhi, Bangalore, Mumbai, Pune, and beyond  
**Pricing**: Freemium model (₹99-199/month for premium features)

## ✨ Key Features

### 🎯 Equipment Detection
- Database of 100+ Indian car models (Maruti, Hyundai, Tata, Mahindra, Kia, etc.)
- 50+ audio equipment items (Pioneer, Sony, JBL, Hertz, Focal)
- Smart validation for impedance matching and power handling
- Visual car diagrams showing speaker placements

### 🎵 Audio Measurement
- Real-time frequency response analysis using phone microphone
- Pink noise and sine sweep test tones (20Hz - 20kHz)
- FFT-based spectrum analyzer
- Before/after comparison graphs

### 🤖 AI Tuning Engine
- **Crossover Calculation**: Linkwitz-Riley 24dB/octave slopes
- **Parametric EQ**: Auto-generated 10-band EQ to flatten response
- **Time Alignment**: Precise delay calculations for phase coherence
- **Gain Structure**: Optimal levels to prevent clipping

### 📤 DSP Export
- Pioneer DEH-80PRS (XML format)
- Sony RSX-GS9
- MiniDSP (JSON/XML)
- Audison Bit One (.bit files)

### 🇮🇳 India-Specific
- **Bilingual UI**: Hindi + English from day one
- **Razorpay Integration**: UPI, cards, wallets, net banking
- **WhatsApp Sharing**: Share graphs and settings instantly
- **Optimized for Budget Phones**: Works smoothly on ₹10-20K Android devices
- **3G Network Support**: Efficient data usage for slower connections
- **Offline Mode**: Core features work without internet

## 🏗️ Project Structure

```
CarAudioAI/
├── mobile-app/              # React Native Expo app
│   ├── app/                 # App screens
│   ├── components/          # Reusable UI components
│   ├── constants/           # Colors, config, etc.
│   ├── hooks/               # Custom React hooks
│   ├── assets/              # Images, fonts
│   └── package.json
│
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── main.py         # FastAPI entry point
│   │   ├── config.py       # Environment configuration
│   │   ├── database.py     # SQLAlchemy setup
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── cars.py
│   │   │   ├── equipment.py
│   │   │   ├── measurements.py
│   │   │   └── tuning.py
│   │   ├── algorithms/     # Core tuning logic
│   │   │   ├── crossover.py
│   │   │   ├── eq_optimizer.py
│   │   │   ├── time_alignment.py
│   │   │   └── dsp_export.py
│   │   ├── data/           # Static databases
│   │   │   ├── indian_cars.json
│   │   │   └── equipment.json
│   │   └── utils/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md
│
├── docs/                    # Documentation
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

**For Mobile App Development**:
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for emulator) OR physical Android device
- Git

**For Backend Development**:
- Python 3.10+
- PostgreSQL 15+
- pip and virtualenv

### Quick Setup

#### 1️⃣ Clone and Setup Mobile App

```bash
cd C:\Users\aditya\Downloads\CarAudioAI\mobile-app

# Install dependencies
npm install

# Start Expo dev server
npm start
```

**Key Dependencies**:
```json
{
  "expo": "~49.0.0",
  "@react-navigation/native": "^6.0",
  "@react-navigation/bottom-tabs": "^6.0",
  "react-native-paper": "^5.0",
  "i18next": "^23.0",
  "react-native-razorpay": "^2.3",
  "react-native-chart-kit": "^6.12"
}
```

#### 2️⃣ Setup Backend

```bash
cd C:\Users\aditya\Downloads\CarAudioAI\backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Setup database
createdb caraudio_dev

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

**Key Dependencies** (requirements.txt):
```
fastapi==0.100.0
uvicorn[standard]==0.23.0
sqlalchemy==2.0.0
psycopg2-binary==2.9.6
pydantic==2.0.0
razorpay==1.4.0
firebase-admin==6.2.0
numpy==1.25.0
scipy==1.11.0
```

### Environment Variables

Create `.env` files:

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:password@localhost/caraudio_dev
SECRET_KEY=your-secret-key-here
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
FIREBASE_PROJECT_ID=your-firebase-project
AWS_ACCESS_KEY=your-aws-key
AWS_SECRET_KEY=your-aws-secret
AWS_BUCKET_NAME=caraudio-files
```

**Mobile App (.env)**:
```env
API_BASE_URL=http://localhost:8000
RAZORPAY_KEY_ID=your-razorpay-key
```

## 📊 Database Schema

### Key Tables

**users**: User accounts (phone auth, subscriptions)  
**cars**: Indian car models database  
**equipment**: Audio equipment catalog  
**user_equipment**: User's car audio setups  
**measurements**: Frequency response measurements  
**tuning_profiles**: Generated tuning configurations  
**payments**: Razorpay transaction history  

See `/backend/app/models/` for detailed schemas.

## 🧪 Testing

### Mobile App
```bash
cd mobile-app
npm test
```

### Backend
```bash
cd backend
pytest tests/ -v
```

### Integration Tests
```bash
# Run full end-to-end test suite
pytest tests/integration/ -v
```

## 📱 Deployment

### Mobile App (Android APK)
```bash
cd mobile-app
eas build --platform android
```

### Backend (AWS / DigitalOcean)
- Deploy to AWS Mumbai region or DigitalOcean Bangalore
- Use AWS RDS for PostgreSQL or managed database
- S3 Mumbai for file storage (DSP configs, images)
- Configure production environment variables

## 🗓️ Development Roadmap

### ✅ Phase 0: Setup (Current)
- [x] Project structure created
- [x] Mobile app initialized with Expo
- [x] Backend virtual environment ready

### 🔄 Phase 1: MVP (Weeks 1-10)
- [ ] **Week 1-2**: Infrastructure (auth, payments, hosting)
- [ ] **Week 3-4**: Equipment detection wizard
- [ ] **Week 5-6**: Audio measurement system
- [ ] **Week 7-8**: AI tuning engine
- [ ] **Week 9-10**: India features, polish, beta testing

### 🔮 Phase 2: Post-MVP
- Advanced phase alignment
- Multi-point measurement averaging
- iOS app development
- Professional installer dashboard
- Community tuning library

## 🤝 Contributing

This is a private project currently in development. For questions or collaboration:

**Developer**: Aditya  
**Contact**: [Your contact info]

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- Car audio expertise from Team-BHP community
- DSP algorithms based on industry standards
- Indian car specifications from CarDekho and manufacturer data
- Equipment pricing from Amazon India and Flipkart

---

**Built with ❤️ for the Indian car audio community**

🚗 *"Turning up the volume on innovation"* 🔊
