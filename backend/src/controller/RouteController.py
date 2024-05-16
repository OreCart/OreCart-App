from abc import ABC, abstractmethod
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from src.models.routes import Route
from typing_extensions import Any, Dict, Optional, Self


class RouteController(ABC):
    @abstractmethod
    async def get_routes(
        self: Self,
        session: AsyncSession,
        stops: Optional[Dict[str, Any]] = None,
        waypoints: bool = False,
        is_active: bool = False,
    ) -> List[Route]:
        pass

    @abstractmethod
    async def get_route(
        self: Self,
        id_: int,
        session: AsyncSession,
        stops: Optional[Dict[str, Any]] = None,
        waypoints: bool = False,
        is_active: bool = False,
    ) -> Optional[Route]:
        pass


class RouteControllerImpl(RouteController):
    async def get_routes(
        self: Self,
        session: AsyncSession,
        stops: Optional[Dict[str, Any]] = None,
        waypoints: bool = False,
        is_active: bool = False,
    ) -> List[Route]:
        pass

    async def get_route(
        self: Self,
        id_: int,
        session: AsyncSession,
        stops: Optional[Dict[str, Any]] = None,
        waypoints: bool = False,
        is_active: bool = False,
    ) -> Optional[Route]:
        pass
