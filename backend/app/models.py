from sqlalchemy import Boolean, Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Region(Base):
    __tablename__ = 'regions'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

class Model(Base):
    __tablename__ = 'models'
    id = Column(Integer, primary_key=True)
    model = Column(String, nullable=False)
    oid = Column(String, nullable=False)

class Device(Base):
    __tablename__ = 'devices'
    id = Column(Integer, primary_key=True)
    bs_name = Column(String, nullable=False)
    ip_bs = Column(String, nullable=False)
    region_id = Column(Integer, ForeignKey('regions.id'), nullable=False)
    ip_switch = Column(String, nullable=False)
    model_id = Column(Integer, ForeignKey('models.id'), nullable=True)
    region = relationship("Region")
    model = relationship("Model")

class PingResult(Base):
    __tablename__ = "ping_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    bs_name = Column(String, nullable=False)
    ping_status = Column(String, nullable=False)
    port_status = Column(String, nullable=True)  # Пока может быть null
    checked_at = Column(DateTime)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")  # user / admin