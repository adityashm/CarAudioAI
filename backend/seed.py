"""
CarAudioAI - Database Seeder Script
Populates the database with Indian Car acoustic specifications and audio equipment catalog.
Usage:
    python seed.py
"""
import json
import os
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.car import Car
from app.models.equipment import Equipment

CARS_JSON = os.path.join(os.path.dirname(__file__), "app", "data", "indian_cars.json")
EQUIPMENT_JSON = os.path.join(os.path.dirname(__file__), "app", "data", "equipment.json")

def seed_database():
    print("🌱 Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # 1. Seed Indian Cars
        print("🚗 Seeding Indian Cars...")
        with open(CARS_JSON, "r", encoding="utf-8") as f:
            cars_data = json.load(f)
            
        car_count = 0
        for car_entry in cars_data:
            make = car_entry.get("make")
            model = car_entry.get("model")
            variants = car_entry.get("variants", [])
            
            for v in variants:
                # Check if already exists
                existing = db.query(Car).filter(
                    Car.make == make,
                    Car.model == model
                ).first()
                
                if not existing:
                    car = Car(
                        make=make,
                        model=model,
                        factory_head_unit=v.get("factory_head_unit"),
                        front_speaker_size=v.get("front_speaker_size"),
                        rear_speaker_size=v.get("rear_speaker_size"),
                        tweeter_location=v.get("tweeter_location"),
                        specs=v.get("specs", {})
                    )
                    db.add(car)
                    car_count += 1
                    
        # 2. Seed Audio Equipment
        print("🔊 Seeding Audio Equipment Catalog...")
        with open(EQUIPMENT_JSON, "r", encoding="utf-8") as f:
            equipment_data = json.load(f)
            
        eq_count = 0
        for eq_entry in equipment_data:
            category = eq_entry.get("category")
            brand = eq_entry.get("brand")
            model = eq_entry.get("model")
            
            existing = db.query(Equipment).filter(
                Equipment.brand == brand,
                Equipment.model == model
            ).first()
            
            if not existing:
                eq = Equipment(
                    category=category,
                    brand=brand,
                    model=model,
                    specs=eq_entry.get("specs", {}),
                    price_inr=eq_entry.get("price_inr"),
                    amazon_link=eq_entry.get("amazon_link"),
                    flipkart_link=eq_entry.get("flipkart_link")
                )
                db.add(eq)
                eq_count += 1
                
        db.commit()
        print(f"✅ Seeding Complete! Added {car_count} cars and {eq_count} equipment items.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error during database seeding: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
