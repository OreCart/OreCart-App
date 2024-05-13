from datetime import datetime, timezone
from typing import Dict, List, Optional, Union

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from backend.src.new.controllers.AlertController import AlertController
from backend.src.new.models.alert import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])
controller = AlertController()


@router.get("/")
def get_alerts(
    req: Request, filter: Optional[str] = None
) -> List[Dict[str, Union[str, int]]]:
    """
    ## Get all alerts. Default returns all alerts (past, present, and future)

    **:param filter:** Optional string filter. Valid values are:

        - "active": returns active alerts
        - "future": returns current and future alerts

    **:return:** alerts in format

        - id
        - text
        - startDateTime
        - endDateTime
    """

    alerts_json: List[str] = []
    for alert in controller.get_alerts(filter):
        alerts_json.append(alert.json())

    return alerts_json


@router.get("/{alert_id}")
def get_alert(req: Request, alert_id: int) -> Dict[str, Union[str, int]]:
    """
    ## Get alert with parameter ID.

    **:param alert_id:** Unique integer ID

    **:return:** alert in format

        - id
        - text
        - startDateTime
        - endDateTime
    """
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


# @router.post("/")
# def post_alert(req: Request, alert_model: AlertModel) -> Dict[str, str]:
#     """
#     ## Create new alert.

#     **:param alert_model:** Alert model containing text, start-time, end-time

#     **:return:** *"OK"* message
#     """
#     with req.app.state.db.session() as session:
#         dt_start_time = datetime.fromtimestamp(alert_model.start_time, timezone.utc)
#         dt_end_time = datetime.fromtimestamp(alert_model.end_time, timezone.utc)

#         alert = Alert(
#             text=alert_model.text,
#             start_datetime=dt_start_time,
#             end_datetime=dt_end_time,
#         )
#         session.add(alert)
#         session.commit()

#     return {"message": "OK"}


# @router.put("/{alert_id}")
# def update_alert(
#     req: Request, alert_id: int, alert_model: AlertModel
# ) -> Dict[str, str]:
#     """
#     ## Update existing alert of parameter ID.

#     **:param alert_id:** Unique integer ID

#     **:return:** *"OK"* message
#     """
#     with req.app.state.db.session() as session:
#         alert: Alert = session.query(Alert).filter_by(id=alert_id).first()
#         if alert is None:
#             return JSONResponse(content={"message": "Alert not found"}, status_code=404)

#         dt_start_time = datetime.fromtimestamp(alert_model.start_time, timezone.utc)
#         dt_end_time = datetime.fromtimestamp(alert_model.end_time, timezone.utc)

#         alert.text = alert_model.text
#         alert.start_datetime = dt_start_time
#         alert.end_datetime = dt_end_time
#         session.commit()

#     return {"message": "OK"}


# @router.delete("/{alert_id}")
# def delete_alert(req: Request, alert_id: int) -> Dict[str, str]:
#     """
#     ## Delete existing alert with parameter ID.

#     **:param alert_id:** Unique integer ID

#     **:return:** *"OK"* message
#     """
#     with req.app.state.db.session() as session:
#         alert: Alert = session.query(Alert).filter_by(id=alert_id).first()
#         if alert is None:
#             return JSONResponse(content={"message": "Alert not found"}, status_code=404)
#         session.query(Alert).filter_by(id=alert_id).delete()
#         session.commit()

#     return {"message": "OK"}
