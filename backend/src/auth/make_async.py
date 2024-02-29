import functools

from fastapi import Request


def make_async(func):
    def func_call_wrapper(session, function, req, *args, **kwargs):
        req.state.session = session
        return function(req, *args, **kwargs)

    @functools.wraps(func)
    async def func_call(req: Request, *args, **kwargs):
        print(f"{req.app.state.db.async_session=}")
        print(f"{req.app.state.db.async_session()=}")
        async with req.app.state.db.async_session() as asession:
            return await asession.run_sync(
                func_call_wrapper, func, req, *args, **kwargs
            )

    return func_call
