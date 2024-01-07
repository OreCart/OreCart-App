from datetime import datetime, timezone
from typing import Dict, List, Optional, Union

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from src.model.alert import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])


class AlertModel(BaseModel):
    """
    A JSON model mapping
    for the Alert object.
    """

    text: str
    start_time: int
    end_time: int


@router.get("/")
def get_alerts(
    req: Request, filter: Optional[str] = None
) -> List[Dict[str, Union[str, int]]]:
    with req.app.state.db.session() as session:
        query = session.query(Alert)
        if filter == "active":
            now = datetime.now(timezone.utc)
            query = query.filter(Alert.start_datetime <= now, Alert.end_datetime >= now)
        elif filter == "future":
            now = datetime.now(timezone.utc)
            query = query.filter(Alert.start_datetime > now)
        elif filter is not None:
            raise HTTPException(status_code=400, detail=f"Invalid filter {filter}")
        alerts = query.all()

    alerts_json: List[Dict[str, Union[str, int]]] = []
    for alert in alerts:
        alert_json = {
            "id": alert.id,
            "text": alert.text,
            "startDateTime": int(alert.start_datetime.timestamp()),
            "endDateTime": int(alert.end_datetime.timestamp()),
        }
        alerts_json.append(alert_json)

    return alerts_json


@router.get("/{alert_id}")
def get_alert(req: Request, alert_id: int) -> Dict[str, Union[str, int]]:
    with req.app.state.db.session() as session:
        alert: Alert = session.query(Alert).filter_by(id=alert_id).first()
        if alert is None:
            return JSONResponse(content={"message": "Alert not found"}, status_code=404)

    alert_json: Dict[str, Union[str, int]] = {
        "id": alert.id,
        "text": alert.text,
        "startDateTime": int(alert.start_datetime.timestamp()),
        "endDateTime": int(alert.end_datetime.timestamp()),
    }

    return alert_json


@router.post("/")
def post_alert(req: Request, alert_model: AlertModel) -> Dict[str, str]:
    with req.app.state.db.session() as session:
        dt_start_time = datetime.fromtimestamp(alert_model.start_time, timezone.utc)
        dt_end_time = datetime.fromtimestamp(alert_model.end_time, timezone.utc)

        alert = Alert(
            text=alert_model.text,
            start_datetime=dt_start_time,
            end_datetime=dt_end_time,
        )
        session.add(alert)
        session.commit()

    return {"message": "OK"}


@router.put("/{alert_id}")
def update_alert(
    req: Request, alert_id: int, alert_model: AlertModel
) -> Dict[str, str]:
    with req.app.state.db.session() as session:
        alert: Alert = session.query(Alert).filter_by(id=alert_id).first()
        if alert is None:
            return JSONResponse(content={"message": "Alert not found"}, status_code=404)

        dt_start_time = datetime.fromtimestamp(alert_model.start_time, timezone.utc)
        dt_end_time = datetime.fromtimestamp(alert_model.end_time, timezone.utc)

        alert.text = alert_model.text
        alert.start_datetime = dt_start_time
        alert.end_datetime = dt_end_time
        session.commit()

    return {"message": "OK"}


@router.delete("/{alert_id}")
def delete_alert(req: Request, alert_id: int) -> Dict[str, str]:
    with req.app.state.db.session() as session:
        alert: Alert = session.query(Alert).filter_by(id=alert_id).first()
        if alert is None:
            return JSONResponse(content={"message": "Alert not found"}, status_code=404)
        session.query(Alert).filter_by(id=alert_id).delete()
        session.commit()

    return {"message": "OK"}
