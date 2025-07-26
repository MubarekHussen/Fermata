"""
Seed data script to populate database with predefined routes and locations
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import AsyncSessionLocal
from app.models.route_model import Route
from app.models.location_model import Location, LocationType
from app.models.taxi_model import Taxi, TaxiStatus, DriverStatus
from app.utils.popular_routes import POPULAR_ROUTES

async def seed_routes():
    """Seed predefined routes into database"""
    async with AsyncSessionLocal() as session:
        try:
            # Check if routes already exist
            existing_routes = await session.execute(
                "SELECT COUNT(*) FROM routes"
            )
            count = existing_routes.scalar()
            
            if count > 0:
                print("Routes already exist in database, skipping...")
                return
            
            # Create routes from popular_routes.py
            for route_id, route_data in POPULAR_ROUTES.items():
                route = Route(
                    id=route_data["id"],
                    name=route_data["name"],
                    description=route_data["description"],
                    origin_lat=route_data["origin"]["lat"],
                    origin_lng=route_data["origin"]["lng"],
                    origin_name=route_data["origin"]["name"],
                    destination_lat=route_data["destination"]["lat"],
                    destination_lng=route_data["destination"]["lng"],
                    destination_name=route_data["destination"]["name"],
                    estimated_time=route_data["estimated_time"],
                    estimated_distance=route_data["estimated_distance"],
                    is_popular=True
                )
                session.add(route)
            
            await session.commit()
            print(f"✅ Successfully seeded {len(POPULAR_ROUTES)} routes")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error seeding routes: {e}")
            raise

async def seed_locations():
    """Seed locations from popular routes"""
    async with AsyncSessionLocal() as session:
        try:
            # Check if locations already exist
            existing_locations = await session.execute(
                "SELECT COUNT(*) FROM locations"
            )
            count = existing_locations.scalar()
            
            if count > 0:
                print("Locations already exist in database, skipping...")
                return
            
            # Get unique locations from popular routes
            locations = set()
            for route_data in POPULAR_ROUTES.values():
                # Add origin
                locations.add((
                    route_data["origin"]["name"],
                    route_data["origin"]["lat"],
                    route_data["origin"]["lng"]
                ))
                # Add destination
                locations.add((
                    route_data["destination"]["name"],
                    route_data["destination"]["lat"],
                    route_data["destination"]["lng"]
                ))
            
            # Create location records
            for name, lat, lng in locations:
                location = Location(
                    name=name,
                    lat=lat,
                    lng=lng,
                    location_type=LocationType.LANDMARK,
                    is_active=True,
                    is_popular=True
                )
                session.add(location)
            
            await session.commit()
            print(f"✅ Successfully seeded {len(locations)} locations")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error seeding locations: {e}")
            raise

async def seed_sample_taxis():
    """Seed sample taxi data"""
    async with AsyncSessionLocal() as session:
        try:
            # Check if taxis already exist
            existing_taxis = await session.execute(
                "SELECT COUNT(*) FROM taxis"
            )
            count = existing_taxis.scalar()
            
            if count > 0:
                print("Taxis already exist in database, skipping...")
                return
            
            # Sample taxi data
            sample_taxis = [
                {
                    "plate_number": "AA-12345",
                    "model": "Toyota Corolla",
                    "color": "White",
                    "year": 2020,
                    "current_lat": 8.989022,
                    "current_lng": 38.79036,
                    "status": TaxiStatus.AVAILABLE,
                    "driver_name": "Abebe Kebede",
                    "driver_phone": "+251911234567",
                    "driver_status": DriverStatus.ACTIVE,
                    "rating": 4.5,
                    "total_trips": 150
                },
                {
                    "plate_number": "BB-67890",
                    "model": "Suzuki Dzire",
                    "color": "Silver",
                    "year": 2019,
                    "current_lat": 9.0123,
                    "current_lng": 38.7567,
                    "status": TaxiStatus.AVAILABLE,
                    "driver_name": "Tadesse Alemu",
                    "driver_phone": "+251922345678",
                    "driver_status": DriverStatus.ACTIVE,
                    "rating": 4.2,
                    "total_trips": 120
                },
                {
                    "plate_number": "CC-11111",
                    "model": "Honda City",
                    "color": "Black",
                    "year": 2021,
                    "current_lat": 9.03045,
                    "current_lng": 38.76530,
                    "status": TaxiStatus.BUSY,
                    "driver_name": "Kebede Tesfaye",
                    "driver_phone": "+251933456789",
                    "driver_status": DriverStatus.ACTIVE,
                    "rating": 4.8,
                    "total_trips": 200
                }
            ]
            
            for taxi_data in sample_taxis:
                taxi = Taxi(**taxi_data)
                session.add(taxi)
            
            await session.commit()
            print(f"✅ Successfully seeded {len(sample_taxis)} taxis")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error seeding taxis: {e}")
            raise

async def seed_all_data():
    """Seed all data into database"""
    print("🌱 Starting database seeding...")
    
    await seed_locations()
    await seed_routes()
    await seed_sample_taxis()
    
    print("✅ Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_all_data()) 