import datetime

from sqlalchemy import DateTime, TypeDecorator


class TZDateTime(TypeDecorator):
    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if (
                not value.tzinfo
                or value.tzinfo.utcoffset(value) is None
                or value.tzinfo != datetime.timezone.utc
            ):
                raise TypeError(f"tzinfo must be UTC, instead got {value.tzinfo}")
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            value = value.replace(tzinfo=datetime.timezone.utc)
        return value
