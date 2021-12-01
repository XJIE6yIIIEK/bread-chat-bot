import GlobalStuff
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, KeyboardButton


def fillInfoKb():
    GlobalStuff.Keyboards.info_kb = InlineKeyboardMarkup()
    for ob in GlobalStuff.CachedDB.info_ab_us:
        GlobalStuff.Keyboards.info_kb.add(InlineKeyboardButton(ob, callback_data="iau:"+str(ob)))


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
