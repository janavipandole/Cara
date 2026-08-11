from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
from ..database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory telemetry log buffer
rum_telemetry_store = []
MAX_STORE_SIZE = 1000

class RUMMetricPayload(BaseModel):
    url: Optional[str] = "/"
    lcp: Optional[float] = None
    cls: Optional[float] = None
    fid: Optional[float] = None
    ttfb: Optional[float] = None
    user_agent: Optional[str] = None

@router.post("/rum")
def collect_rum_telemetry(payload: RUMMetricPayload):
    global rum_telemetry_store
    record = {
        "url": payload.url,
        "lcp": payload.lcp,
        "cls": payload.cls,
        "fid": payload.fid,
        "ttfb": payload.ttfb,
        "user_agent": payload.user_agent,
    }
    rum_telemetry_store.append(record)
    if len(rum_telemetry_store) > MAX_STORE_SIZE:
        rum_telemetry_store = rum_telemetry_store[-MAX_STORE_SIZE:]

    return {"status": "accepted"}

@router.get("/summary")
def get_telemetry_summary():
    if not rum_telemetry_store:
        return {
            "total_sessions": 0,
            "avg_lcp_ms": 0.0,
            "avg_cls": 0.0,
            "avg_fid_ms": 0.0,
            "avg_ttfb_ms": 0.0,
            "health_status": "GOOD",
        }

    lcps = [r["lcp"] for r in rum_telemetry_store if r.get("lcp") is not None]
    clss = [r["cls"] for r in rum_telemetry_store if r.get("cls") is not None]
    fids = [r["fid"] for r in rum_telemetry_store if r.get("fid") is not None]
    ttfbs = [r["ttfb"] for r in rum_telemetry_store if r.get("ttfb") is not None]

    avg_lcp = round(sum(lcps) / len(lcps), 2) if lcps else 0.0
    avg_cls = round(sum(clss) / len(clss), 3) if clss else 0.0
    avg_fid = round(sum(fids) / len(fids), 2) if fids else 0.0
    avg_ttfb = round(sum(ttfbs) / len(ttfbs), 2) if ttfbs else 0.0

    health = "GOOD"
    if avg_lcp > 2500 or avg_cls > 0.1:
        health = "NEEDS_IMPROVEMENT"
    if avg_lcp > 4000 or avg_cls > 0.25:
        health = "POOR"

    return {
        "total_sessions": len(rum_telemetry_store),
        "avg_lcp_ms": avg_lcp,
        "avg_cls": avg_cls,
        "avg_fid_ms": avg_fid,
        "avg_ttfb_ms": avg_ttfb,
        "health_status": health,
    }
