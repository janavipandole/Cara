import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.database import Base, get_db

# Set up test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine_test = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

Base.metadata.create_all(bind=engine_test)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_register_duplicate_email():
    print("Running Backend Validation Test for Duplicate Email Registration...")
    # Setup test database clean state
    Base.metadata.drop_all(bind=engine_test)
    Base.metadata.create_all(bind=engine_test)
    
    user_data = {
        "name": "Test User",
        "email": "Test@example.com",
        "password": "Password123!"
    }
    
    # Register once
    response1 = client.post("/api/auth/register", json=user_data)
    assert response1.status_code == 200, f"Expected 200, got {response1.status_code}"
    print("1. Successfully registered first user.")
    
    # Attempt to register again with exact same email
    response2 = client.post("/api/auth/register", json=user_data)
    assert response2.status_code == 400, f"Expected 400, got {response2.status_code}"
    assert response2.json()["detail"] == "Email already registered"
    print("2. Correctly prevented duplicate exact email.")

    # Attempt to register again with lowercase email
    user_data_lower = {
        "name": "Test User 2",
        "email": "test@example.com",
        "password": "Password123!"
    }
    response3 = client.post("/api/auth/register", json=user_data_lower)
    assert response3.status_code == 400, f"Expected 400, got {response3.status_code}"
    assert response3.json()["detail"] == "Email already registered"
    print("3. Correctly prevented duplicate case-insensitive email.")

    print("All backend validation tests passed successfully!")

if __name__ == "__main__":
    test_register_duplicate_email()
