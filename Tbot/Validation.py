import re


def is_valid_date(text: str) -> bool:
    return True if re.fullmatch("[1-2][0-9]{3}-(0[1-9]|1[0-2])-[0-3][0-9]", text) else False
