from controller.AlertController import InvalidFilterException, NotFoundException
from fastapi import Request
from fastapi.responses import JSONResponse
from flask import app


@app.exception_handler(InvalidFilterException)
async def invalid_filter_exception_handler(
    request: Request, exc: InvalidFilterException
):
    return JSONResponse(
        status_code=400,
        content={"message": f"Invalid filter {exc.name}"},
    )


@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request: Request, exc: NotFoundException):
    return JSONResponse(
        status_code=404,
        content={"message": f"Alert by id {exc.id} not found"},
    )
