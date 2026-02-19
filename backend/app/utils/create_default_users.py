# backend/app/utils/create_default_users.py
from sqlalchemy.orm import Session
from ..models.user import User, UserRole
from ..api.auth import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_default_users(db: Session):
    """Create default users if they don't exist"""
    
    default_users = [
        {
            "username": "admin",
            "email": "admin@market-surveillance.com",
            "password": "admin123",
            "full_name": "System Administrator",
            "role": UserRole.ADMIN
        },
        {
            "username": "analyst",
            "email": "analyst@market-surveillance.com",
            "password": "analyst123",
            "full_name": "Senior Analyst",
            "role": UserRole.ANALYST
        },
        {
            "username": "viewer",
            "email": "viewer@market-surveillance.com",
            "password": "viewer123",
            "full_name": "Report Viewer",
            "role": UserRole.VIEWER
        }
    ]
    
    created_count = 0
    for user_data in default_users:
        # Check if user exists
        existing_user = db.query(User).filter(
            (User.username == user_data["username"]) | 
            (User.email == user_data["email"])
        ).first()
        
        if not existing_user:
            hashed_password = get_password_hash(user_data["password"])
            new_user = User(
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=hashed_password,
                full_name=user_data["full_name"],
                role=user_data["role"],
                is_active=True
            )
            db.add(new_user)
            created_count += 1
            logger.info(f"Created user: {user_data['username']} with role {user_data['role']}")
    
    if created_count > 0:
        db.commit()
        logger.info(f"✅ Created {created_count} default users")
    else:
        logger.info("✅ Default users already exist")
    
    # Log existing users for debugging
    users = db.query(User).all()
    logger.info(f"Total users in database: {len(users)}")
    for user in users:
        logger.info(f"  - {user.username} ({user.role})")