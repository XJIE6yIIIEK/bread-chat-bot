import datetime


def is_valid_date(text: str) -> bool:
    try:
        datetime.datetime.strptime(text, "%Y-%m-%d")
        return True
    except Exception:
        return False


def is_valid_str(text: str) -> bool:
    return len(text) <= 64
