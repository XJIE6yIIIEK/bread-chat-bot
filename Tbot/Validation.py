import datetime
import re


def is_valid_date(text: str) -> bool:
    try:
        datetime.datetime.strptime(text, "%Y-%m-%d")
        return True
    except Exception:
        return False


def is_valid_str(text: str) -> bool:
    return len(text) <= 256


def is_valid_name(text: str) -> bool:
    return re.search(r"[^а-яА-Я\s]", text) is None


def is_valid_town(text: str) -> bool:
    return re.search(r"[^а-яА-Я0-9\-\s]", text) is None


def is_valid_phone(text: str) -> bool:
    return re.search(r"\+?[1-9][0-9]{0,5}[0-9]{10}", text) is not None


def is_valid_email(text: str) -> bool:
    return re.search(r"[a-zA-Z][a-zA-Z_0-9.\-]*?@[a-zA-Z][a-zA-Z0-9-.\-]*\.[a-zA-Z0-9-.\-]*", text) is not None
