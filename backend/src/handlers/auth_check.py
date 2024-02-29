from typing import Annotated

from fastapi import APIRouter, Depends, Request
from src.auth.user_manager import current_user
from src.model.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/check")
async def auth_check(req: Request, user: Annotated[User, Depends(current_user)]):
    """Sends a 401 if the client does not pass a valid authentication cookie."""
    pass
