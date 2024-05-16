from abc import ABC, abstractmethod
from typing import List, Optional

from sqlalchemy import delete, insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.van import VanModel
from src.models.vans import Van
from src.request import process_include


class VanController(ABC):
    @abstractmethod
    async def get_vans(self, session: AsyncSession) -> List[Van]:
        pass

    @abstractmethod
    async def get_van(self, session: AsyncSession, alert_id: int) -> Van:
        pass


class VanControllerImpl(VanController):
    async def get_vans(self, session: AsyncSession) -> List[Van]:
        query = select(VanModel).order_by(VanModel.id)
        vans: List[VanModel] = (await session.scalars(query)).all()

        returned_vans: List[Van] = []

        # include_set = process_include(include=include, allowed=INCLUDES)

        last_id = vans[0].id if vans else None
        for van in vans:
            if last_id is not None:
                gap = van.id - last_id
                for i in range(1, gap):
                    returned_vans.append(
                        id=last_id + i, route_id=van.route_id, guid="16161616"
                    )
            returned_vans.append(id=van.id, route_id=van.route_id, guid=van.guid)
            last_id = van.id

        return returned_vans

    async def get_van(self, session: AsyncSession, alert_id: int) -> Van:
        pass
