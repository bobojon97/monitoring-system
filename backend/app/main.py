from datetime import datetime, timezone
from typing import Dict, Optional
from fastapi import Body, FastAPI, Depends, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, joinedload, Session, aliased
import os
from app.models import Base, Device, Model, PingResult, Region, User
import asyncio
from zoneinfo import ZoneInfo
from passlib.context import CryptContext
from app.schemas import DeviceCreate, DeviceUpdate, ModelCreate, RegionCreate

app = FastAPI()

engine = create_engine(os.getenv("DATABASE_URL"))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LOCAL_TZ = ZoneInfo("Asia/Dushanbe")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/devices/")
async def get_devices():
    db = SessionLocal()
    try:
        devices = db.query(Device).options(joinedload(Device.region), joinedload(Device.model)).all()

        result = []
        for d in devices:
            result.append({
                "id": d.id,
                "bs_name": d.bs_name,
                "ip_bs": d.ip_bs,
                "ip_switch": d.ip_switch,
                "model": {
                    "id": d.model.id if d.model else None,
                    "model": d.model.model if d.model else None,
                    "oid": d.model.oid if d.model else None
                },
                "region": {
                    "id": d.region.id if d.region else None,
                    "name": d.region.name if d.region else None
                }
            })

        return {"count": len(result), "devices": result}
    finally:
        db.close()


@app.post("/regions/")
async def create_region(region: RegionCreate):
    db = SessionLocal()
    try:
        new_region = Region(name=region.name)
        db.add(new_region)
        db.commit()
        db.refresh(new_region)
        return {
            "message": "Region created",
            "region": {"id": new_region.id, "name": new_region.name}
        }
    finally:
        db.close()

@app.post("/models/")
async def create_model(model_data: ModelCreate):
    db = SessionLocal()
    try:
        db_model = Model(model=model_data.model, oid=model_data.oid)
        db.add(db_model)
        db.commit()
        db.refresh(db_model)
        return {
            "message": "Model created",
            "model": {
                "id": db_model.id,
                "model": db_model.model,
                "oid": db_model.oid
            }
        }
    finally:
        db.close()


@app.post("/devices/")
async def create_device(device: DeviceCreate):
    db = SessionLocal()
    try:
        new_device = Device(
            bs_name=device.bs_name,
            ip_bs=device.ip_bs,
            region_id=device.region_id,
            ip_switch=device.ip_switch,
            model_id=device.model_id
        )
        db.add(new_device)
        db.commit()
        db.refresh(new_device)
        return {
            "message": "Device created",
            "device": {"id": new_device.id, "bs_name": new_device.bs_name}
        }
    finally:
        db.close()



async def async_ping_host(ip: str) -> bool:
    try:
        proc = await asyncio.create_subprocess_exec(
            "ping", "-c", "1", "-W", "2", ip,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        return await proc.wait() == 0
    except Exception:
        return False


@app.get("/ping-devices/")
async def ping_devices(db: Session = Depends(get_db)):
    devices = db.query(Device).all()

    tasks = [async_ping_host(device.ip_bs) for device in devices]
    results = await asyncio.gather(*tasks)

    response = []

    for device, result in zip(devices, results):
        status = "up" if result else "down"

        # Запись в таблицу PingResult
        ping_result = PingResult(
            bs_name=device.bs_name,
            ping_status=status,
            port_status=None,  # Пока не реализуем проверку порта
            checked_at=datetime.now().replace(microsecond=0)
        )
        db.add(ping_result)

        # Добавим в response
        response.append({
            "bs_name": device.bs_name,
            "ip_bs": device.ip_bs,
            "status": status,
        })

    db.commit()
    return response

@app.get("/ping-results/")
def get_ping_results(db: Session = Depends(get_db)):
    subq = (
        db.query(
            PingResult.bs_name,
            func.max(PingResult.checked_at).label("max_checked_at")
        )
        .group_by(PingResult.bs_name)
        .subquery()
    )

    pr = aliased(PingResult)
    results = (
        db.query(pr)
        .join(
            subq,
            (pr.bs_name == subq.c.bs_name) &
            (pr.checked_at == subq.c.max_checked_at)
        )
        .filter(pr.ping_status == "down")  # 🔹 фильтр по ping_status
        .order_by(pr.checked_at.desc())
        .all()
    )

    return [
        {
            "bs_name": r.bs_name,
            "ping_status": r.ping_status,
            "port_status": r.port_status,
            "checked_at": r.checked_at.replace(tzinfo=timezone.utc)
                                       .strftime("%Y-%m-%d %H:%M")
        }
        for r in results
    ]

@app.get("/regions/")
async def get_regions():
    db: Session = SessionLocal()
    try:
        regions = db.query(Region).all()
        return [{"id": r.id, "name": r.name} for r in regions]
    finally:
        db.close()

# Получить список моделей
@app.get("/device-types/")
async def get_device_types():
    db: Session = SessionLocal()
    try:
        models = db.query(Model).all()
        return [{"id": m.id, "name": m.model} for m in models]
    finally:
        db.close()

@app.get("/get-device/")
def get_devices(db: Session = Depends(get_db)):
    devices = db.query(Device.id, Device.bs_name).all()
    return [{"id": d.id, "bs_name": d.bs_name} for d in devices]


from sqlalchemy import func

@app.get("/history/")
def get_history(
    bs_name: Optional[str] = None,
    ping_status: Optional[str] = None,
    port_status: Optional[str] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    page: int = Query(1, ge=1),          # Страница (>=1)
    limit: int = Query(20, le=100),      # Лимит (макс 100)
    db: Session = Depends(get_db)
):
    query = db.query(PingResult)

    if bs_name:
        query = query.filter(PingResult.bs_name == bs_name)
    if ping_status:
        query = query.filter(PingResult.ping_status == ping_status)
    if port_status:
        query = query.filter(PingResult.port_status == port_status)
    if start:
        query = query.filter(PingResult.checked_at >= start)
    if end:
        query = query.filter(PingResult.checked_at <= end)

    # Если нет фильтров → последние уникальные по bs_name
    if not any([bs_name, ping_status, port_status, start, end]):
        subquery = (
            db.query(
                PingResult.bs_name,
                func.max(PingResult.checked_at).label("max_checked_at")
            )
            .group_by(PingResult.bs_name)
            .subquery()
        )
        query = db.query(PingResult).join(
            subquery,
            (PingResult.bs_name == subquery.c.bs_name) &
            (PingResult.checked_at == subquery.c.max_checked_at)
        )

    # Сортировка
    query = query.order_by(PingResult.checked_at.desc())

    # Пагинация
    total = query.count()
    results = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "data": [
            {
                "bs_name": r.bs_name,
                "ping_status": r.ping_status,
                "port_status": r.port_status,
                "checked_at": r.checked_at.replace(tzinfo=timezone.utc)
                    .strftime("%Y-%m-%d %H:%M")
            }
            for r in results
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit,
            "has_next": page * limit < total,
            "has_prev": page > 1
        }
    }

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

@app.post("/register")
def register(username: str, password: str, role: str, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="User already exists")
    user = User(
        username=username,
        password_hash=hash_password(password),
        role=role
    )
    db.add(user)
    db.commit()
    return {"message": "User created", "role": user.role}

@app.post("/login")
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "message": "Login successful",
        "username": user.username,
        "role": user.role
    }


@app.put("/devices/{device_id}", response_model=Dict)
def update_device(
    device_id: int,
    device_update: DeviceUpdate = Body(...),
    db: Session = Depends(get_db)
):
    # Ищем устройство
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    # Обновляем только переданные поля
    update_data = device_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(device, key, value)

    db.commit()
    db.refresh(device)

    return {
        "message": "Device updated successfully",
        "device": {
            "id": device.id,
            "bs_name": device.bs_name,
            "ip_bs": device.ip_bs,
            "ip_switch": device.ip_switch,
            "model_id": device.model_id,
            "region_id": device.region_id
        }
    }

@app.delete("/devices/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    db.query(PingResult).filter(PingResult.bs_name == device.bs_name).delete()

    db.delete(device)
    db.commit()

    return {"message": "Device deleted successfully"}