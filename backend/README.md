# CarAudioAI Backend

FastAPI backend for AI-powered car audio tuning application.

## Features

- RESTful API with FastAPI
- PostgreSQL database with SQLAlchemy ORM
- Phone authentication (Firebase Auth)
- Razorpay payment integration
- Audio tuning algorithms (crossover, EQ, time alignment)
- DSP config export (Pioneer, Sony, MiniDSP, Audison)
- Indian car database (100+ models)
- Audio equipment catalog (50+ products)

## Setup

### Prerequisites

- Python 3.10+
- PostgreSQL 15+
- Virtual environment

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create database
createdb caraudio_dev

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations (coming soon with Alembic)
# alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

Server will run at: http://localhost:8000

API documentation: http://localhost:8000/api/docs

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings
│   ├── database.py          # SQLAlchemy setup
│   ├── models/              # Database models
│   │   ├── user.py
│   │   ├── car.py
│   │   ├── equipment.py
│   │   ├── user_equipment.py
│   │   ├── measurement.py
│   │   ├── tuning_profile.py
│   │   └── payment.py
│   ├── schemas/             # Pydantic schemas (coming soon)
│   ├── routers/             # API endpoints (coming soon)
│   ├── algorithms/          # Tuning algorithms (coming soon)
│   ├── data/                # Static data
│   │   ├── indian_cars.json
│   │   └── equipment.json
│   └── utils/               # Helper functions (coming soon)
├── tests/                   # Test suite
├── requirements.txt
└── README.md
```

## Database Models

- **users**: User accounts, subscriptions
- **cars**: Indian car models database
- **equipment**: Audio equipment catalog
- **user_equipment**: User's car audio setups
- **measurements**: Frequency response measurements
- **tuning_profiles**: AI-generated tuning configurations
- **payments**: Razorpay transactions

## API Endpoints (Coming Soon)

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login

### Cars
- `GET /api/cars/makes` - List car manufacturers
- `GET /api/cars/models/{make}` - List models by make
- `GET /api/cars/{id}` - Get car specifications

### Equipment
- `GET /api/equipment/dsp` - List DSP units
- `GET /api/equipment/amplifiers` - List amplifiers
- `GET /api/equipment/speakers` - List speakers
- `GET /api/equipment/subwoofers` - List subwoofers

### Measurements
- `POST /api/measurements` - Save frequency response
- `GET /api/measurements/{id}` - Get measurement

### Tuning
- `POST /api/tuning/generate` - Generate tuning profile
- `POST /api/tuning/export` - Export DSP config file
- `GET /api/tuning/{id}` - Get tuning profile

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Handle webhook

## Development

```bash
# Run tests
pytest tests/ -v

# Format code
black app/

# Run server with auto-reload
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

See `.env.example` for required configuration.

## License

Proprietary - All rights reserved
