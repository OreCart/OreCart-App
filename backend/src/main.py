from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db.base import init

from .db import DBWrapper
from .handlers import ada, alert, analytics, routes, stops, vans

# from .handlers import ada, ridership, routes, stops, vans
from .hardware import HardwareExceptionMiddleware
from .model.van_tracker_session import VanTrackerSession
from .routes import alerts
from .vantracking.factory import van_tracker

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(HardwareExceptionMiddleware)
# app.include_router(ada.router)
# app.include_router(routes.router)
# app.include_router(stops.router)
app.include_router(alerts.router)
# app.include_router(ridership.router)
# app.include_router(vans.router)


@app.on_event("startup")
def startup_event():
    init()
    app.state.van_tracker = van_tracker()
    app.state.db = DBWrapper()
    with app.state.db.session() as session:
        tracker_sessions = session.query(VanTrackerSession).all()
        for tracker_session in tracker_sessions:
            tracker_session.dead = True
        session.commit()
