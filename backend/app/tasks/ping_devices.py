import asyncio
from datetime import datetime
from app.taskiq_config import broker
from app.main import SessionLocal  # твой sessionmaker
from app.models import Device, PingResult  # твои модели


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


@broker.task
async def ping_devices_task() -> dict:
    """Асинхронная задача: пингуем все устройства и пишем результат в PingResult."""
    db = SessionLocal()
    try:
        devices = db.query(Device).all()
        tasks = [async_ping_host(d.ip_bs) for d in devices]
        results = await asyncio.gather(*tasks, return_exceptions=False)

        now = datetime.now().replace(microsecond=0)

        for device, ok in zip(devices, results):
            db.add(PingResult(
                bs_name=device.bs_name,
                ping_status="up" if ok else "down",
                port_status=None,
                checked_at=now,
            ))
        db.commit()
        return {"processed": len(devices)}
    finally:
        db.close()
