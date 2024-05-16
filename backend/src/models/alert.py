from pydantic import BaseModel


class Alert(BaseModel):
    text: str
    start_time: int
    end_time: int
