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


def fillYesnoKb():
    GlobalStuff.Keyboards.yesno_kb = InlineKeyboardMarkup()
    GlobalStuff.Keyboards.yesno_kb.add(InlineKeyboardButton("Да", callback_data="yon:YES"))
    GlobalStuff.Keyboards.yesno_kb.add(InlineKeyboardButton("Нет", callback_data="yon:NO"))


def fillReplyKbs():
    GlobalStuff.Keyboards.hub_kb.add(KeyboardButton('Расскажи мне про вашу компанию'))
    GlobalStuff.Keyboards.hub_kb.add(KeyboardButton('Хочу работать у вас'))
    GlobalStuff.Keyboards.yesno2_kb.add(KeyboardButton("Да"))
    GlobalStuff.Keyboards.yesno2_kb.add(KeyboardButton("нет"))
