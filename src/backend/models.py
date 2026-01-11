# SQLAlchemy Models for PostgreSQL Database
# Copy this to your Flask backend

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()

# User Roles Enum
class UserRole(enum.Enum):
    user = "user"
    moderator = "moderator"
    admin = "admin"

# User Status Enum
class UserStatus(enum.Enum):
    active = "active"
    inactive = "inactive"
    banned = "banned"

class User(Base):
    """User model with admin role support"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.user, nullable=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.active, nullable=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    activity_logs = relationship("UserActivityLog", back_populates="user")
    chat_histories = relationship("ChatHistory", back_populates="user")

class Place(Base):
    """Place model with monetization features"""
    __tablename__ = 'places'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    address = Column(String(500), nullable=True)
    latitude = Column(String(20), nullable=True)
    longitude = Column(String(20), nullable=True)
    
    # Monetization Features
    is_promoted = Column(Boolean, default=False, nullable=False, index=True)
    promoted_score = Column(Integer, default=0, nullable=False)
    promotion_expiry = Column(DateTime, nullable=True)
    
    # Analytics
    views_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SystemConfig(Base):
    """Key-Value configuration table for dynamic settings"""
    __tablename__ = 'system_configs'
    
    id = Column(Integer, primary_key=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    description = Column(String(500), nullable=True)
    category = Column(String(50), nullable=False, default='System')
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserActivityLog(Base):
    """Universal telemetry for user actions"""
    __tablename__ = 'user_activity_logs'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    action_type = Column(String(50), nullable=False, index=True)  # page_view, click, form_submit, scroll, custom
    target_element = Column(String(255), nullable=True)
    page_url = Column(String(500), nullable=False, index=True)
    meta_data = Column(JSONB, nullable=True)  # Flexible JSON data
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    browser = Column(String(50), nullable=True)
    os = Column(String(50), nullable=True)
    device_type = Column(String(20), nullable=True)  # desktop, mobile, tablet
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="activity_logs")

class SecurityLog(Base):
    """Security incident tracking"""
    __tablename__ = 'security_logs'
    
    id = Column(Integer, primary_key=True)
    ip_address = Column(String(45), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # Failed Login, Rate Limit, SQL Injection, etc.
    severity = Column(String(20), nullable=False, index=True)  # low, medium, high, critical
    count = Column(Integer, default=1, nullable=False)
    is_blocked = Column(Boolean, default=False, nullable=False)
    meta_data = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ChatHistory(Base):
    """User-AI conversation storage"""
    __tablename__ = 'chat_histories'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    session_id = Column(String(100), nullable=True)
    messages = Column(JSONB, nullable=False)  # Array of {role, content, timestamp}
    tokens_used = Column(Integer, default=0, nullable=False)
    model_used = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="chat_histories")


# SQL for creating indexes (run after table creation)
"""
-- Performance indexes
CREATE INDEX idx_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action_page ON user_activity_logs(action_type, page_url);
CREATE INDEX idx_security_logs_ip_severity ON security_logs(ip_address, severity);
CREATE INDEX idx_chat_histories_user_created ON chat_histories(user_id, created_at DESC);
CREATE INDEX idx_places_promoted ON places(is_promoted DESC, promoted_score DESC);
"""
