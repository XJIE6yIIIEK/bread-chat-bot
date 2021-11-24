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
    GlobalStuff.Keyboards.hub_kb.add(KeyboardButton('Расскажи мне про вашу компанию'))
    GlobalStuff.Keyboards.hub_kb.add(KeyboardButton('Хочу работать у вас'))
    GlobalStuff.Keyboards.hub_kb.add(KeyboardButton('Хочу изменить основную информацию о себе'))
    GlobalStuff.Keyboards.yesno_kb.add(KeyboardButton("Да"))
    GlobalStuff.Keyboards.yesno_kb.add(KeyboardButton("Нет"))
