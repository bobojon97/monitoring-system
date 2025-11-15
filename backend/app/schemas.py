from pydantic import BaseModel
from typing import Optional

class DeviceCreate(BaseModel):
    bs_name: str
    ip_bs: str
    region_id: int
    ip_switch: str
    model_id: Optional[int] = None


class RegionCreate(BaseModel):
    name: str

class ModelCreate(BaseModel):
    model: str
    oid: str


class DeviceUpdate(BaseModel):
    bs_name: Optional[str] = None
    ip_bs: Optional[str] = None
    ip_switch: Optional[str] = None
    model_id: Optional[int] = None
    region_id: Optional[int] = None