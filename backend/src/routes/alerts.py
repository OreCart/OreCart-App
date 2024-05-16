from typing import Dict, List, Optional, Union

from fastapi import APIRouter, Request
from src.controller.AlertController import get_alert_controller
from src.db.base import make_session
from src.models.alert import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])
controller = get_alert_controller()


@router.get("/")
async def get_alerts(
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
    session_maker = make_session()
    async with session_maker() as session:
        return await controller.get_alerts(session, filter)


@router.get("/{alert_id}")
async def get_alert(req: Request, alert_id: int) -> Dict[str, Union[str, int]]:
    """
    ## Get alert with parameter ID.

    **:param alert_id:** Unique integer ID

    **:return:** alert in format

        - id
        - text
        - startDateTime
        - endDateTime
    """
    session_maker = make_session()
    async with session_maker() as session:
        return await controller.get_alert(session, alert_id)


@router.post("/")
async def post_alert(req: Request, alert_model: Alert) -> Dict[str, str]:
    """
    ## Create new alert.

    **:param alert_model:** Alert model containing text, start-time, end-time

    **:return:** *"OK"* message
    """
    session_maker = make_session()
    async with session_maker() as session:
        await controller.create_alert(session, alert_model)

    return {"message": "OK"}


@router.put("/{alert_id}")
async def update_alert(
    req: Request, alert_id: int, alert_model: Alert
) -> Dict[str, str]:
    """
    ## Update existing alert of parameter ID.

    **:param alert_id:** Unique integer ID

    **:return:** *"OK"* message
    """
    session_maker = make_session()
    async with session_maker() as session:
        await controller.update_alert(session, alert_id, alert_model)

    return {"message": "OK"}


@router.delete("/{alert_id}")
async def delete_alert(req: Request, alert_id: int) -> Dict[str, str]:
    """
    ## Delete existing alert with parameter ID.

    **:param alert_id:** Unique integer ID

    **:return:** *"OK"* message
    """
    session_maker = make_session()
    async with session_maker() as session:
        await controller.delete_alert(session, alert_id)

    return {"message": "OK"}
