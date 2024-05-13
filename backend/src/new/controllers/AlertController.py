from datetime import datetime, timezone
from typing import List, Optional

from flask import app

from backend.src.new.db.alert import AlertModel
from backend.src.new.models.alert import Alert


class AlertController:
    def get_alerts(filter: Optional[str] = None) -> List[Alert]:
        with app.state.db.session() as session:
            query = session.query(AlertModel)
            if filter == "active":
                now = datetime.now(timezone.utc)
                query = query.filter(
                    AlertModel.start_datetime <= now, AlertModel.end_datetime >= now
                )
            elif filter == "future":
                now = datetime.now(timezone.utc)
                query = query.filter(AlertModel.start_datetime > now)
            elif filter is not None:
                # TODO Raise custom exception
                # raise HTTPException(status_code=400, detail=f"Invalid filter {filter}")
                pass
            alerts: List[AlertModel] = query.all()

        returned_alerts: List[Alert] = []
        for alert in alerts:
            returned_alerts.append(
                Alert(
                    id=alert.id,
                    text=alert.text,
                    startDateTime=int(
                        alert.start_datetime.timestamp(),
                        endDateTime=int(alert.end_datetime.timestamp()),
                    ),
                )
            )

        return returned_alerts


# @router.get("/{alert_id}")
# def get_alert(req: Request, alert_id: int) -> Dict[str, Union[str, int]]:
#     """
#     ## Get alert with parameter ID.

#     **:param alert_id:** Unique integer ID

#     **:return:** alert in format

#         - id
#         - text
#         - startDateTime
#         - endDateTime
#     """
#     with req.app.state.db.session() as session:
#         alert: Alert = session.query(Alert).filter_by(id=alert_id).first()
#         if alert is None:
#             return JSONResponse(content={"message": "Alert not found"}, status_code=404)

#     alert_json: Dict[str, Union[str, int]] = {
#         "id": alert.id,
#         "text": alert.text,
#         "startDateTime": int(alert.start_datetime.timestamp()),
#         "endDateTime": int(alert.end_datetime.timestamp()),
#     }

#     return alert_json


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
