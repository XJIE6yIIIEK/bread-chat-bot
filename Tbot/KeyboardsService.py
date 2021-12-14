import GlobalStuff
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, KeyboardButton


def fillInfoKb():
    GlobalStuff.Keyboards.info_kb = InlineKeyboardMarkup()
    iau = GlobalStuff.CachedDB.info_ab_us
    for ob in iau:
        GlobalStuff.Keyboards.info_kb.add(InlineKeyboardButton(iau[ob]["name"], callback_data="iau:"+str(ob)))


def fillVacsKb():
    GlobalStuff.Keyboards.vacs_kb = InlineKeyboardMarkup()
    for ob in GlobalStuff.CachedDB.all_vacs:
        GlobalStuff.Keyboards.vacs_kb.add(InlineKeyboardButton(GlobalStuff.CachedDB.all_vacs[ob], callback_data="vac:"+str(ob)))


def fillReplyKbs():
    GlobalStuff.Keyboards.hub_kb.add(KeyboardButton(GlobalStuff.Phrases.talk_commands["tell_info"]))
    GlobalStuff.Keyboards.hub_kb.add(KeyboardButton(GlobalStuff.Phrases.talk_commands["want_work"]))
    GlobalStuff.Keyboards.hub_kb.add(KeyboardButton(GlobalStuff.Phrases.talk_commands["want_change"]))
    GlobalStuff.Keyboards.yesno_kb.add(KeyboardButton(GlobalStuff.Phrases.talk_commands["yes"]))
    GlobalStuff.Keyboards.yesno_kb.add(KeyboardButton(GlobalStuff.Phrases.talk_commands["no"]))
    GlobalStuff.Keyboards.ok_kb.add(KeyboardButton(GlobalStuff.Phrases.talk_commands["ok"]))


def chooseDateKb() -> InlineKeyboardMarkup:
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton(GlobalStuff.Phrases.talk_commands["choose_date "], callback_data="start_date_choose"))
    return kb


def createMeetingVacanciesKb(dates) -> InlineKeyboardMarkup:
    kb = None
    all_vacs = GlobalStuff.CachedDB.all_vacs
    if len(dates) != 0:
        kb = InlineKeyboardMarkup()
    for vac in dates:
        if vac in all_vacs:
            kb.add(InlineKeyboardButton(all_vacs[vac], callback_data="meeting/vac/"+str(vac)))
    return kb


def createDatesKb(vac_dates, vac: int, page_start: int) -> InlineKeyboardMarkup:
    kb = InlineKeyboardMarkup()
    max_i = len(vac_dates)
    end = min(page_start+5, max_i)
    for date_i in range(page_start, end):
        kb.add(InlineKeyboardButton(vac_dates[date_i].date, callback_data="meeting/date/"+str(vac)+"/"+str(date_i)))

    case_at_start = page_start == 0
    case_at_end = end == max_i
    buttons_prev = InlineKeyboardButton("<-", callback_data="meeting/prev/"+str(vac)+"/"+str(max(0, page_start-5)))
    buttons_next = InlineKeyboardButton("->", callback_data="meeting/next/"+str(vac)+"/"+str(end))

    if not case_at_start and not case_at_end:
        kb.row(buttons_prev, buttons_next)
    elif case_at_start and not case_at_end:
        kb.row(buttons_next)
    elif not case_at_start and case_at_end:
        kb.row(buttons_prev)

    return kb


def createTimesKb(date_times, vac: int, date: int) -> InlineKeyboardMarkup:
    kb = InlineKeyboardMarkup()
    for time_i in range(len(date_times)):
        kb.add(InlineKeyboardButton(date_times[time_i].beginEnd, callback_data="meeting/confirm/"+str(vac)+"/"+str(date)+"/"+str(time_i)))
    kb.add(InlineKeyboardButton("Назад", callback_data="meeting/back"+"/"+str(vac)))
    return kb


def createTimeConfirmKb(call_data: str, vac: int, date: int):
    kb = InlineKeyboardMarkup()
    kb.add(InlineKeyboardButton("Да", callback_data=call_data.replace("confirm", "set")))
    kb.add(InlineKeyboardButton("Нет", callback_data="meeting/date/"+str(vac)+"/"+str(date)))
    return kb


