from aiogram import Bot, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from aiogram.dispatcher import Dispatcher
from aiogram.dispatcher.filters.state import State, StatesGroup
from aiogram.utils import executor
#from aiogram.utils.markdown import text, bold, italic, code, pre
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.contrib.middlewares.logging import LoggingMiddleware

TOKEN

bot = Bot(token=TOKEN)
dp = Dispatcher(bot, storage=MemoryStorage())
dp.middleware.setup(LoggingMiddleware())

hub_kb = ReplyKeyboardMarkup(resize_keyboard=True)#one_time_keyboard=True
hub_kb.add(KeyboardButton('Расскажи мне про вашу компанию'))
hub_kb.add(KeyboardButton('Хочу работать у вас'))

class states(StatesGroup):
    HUB = State()
    INFO = State()
    VACS = State()
    INTERVIEW = State()
    ATTACK = State()

#_______________________________________________________
#====================INFO=VARS==========================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
info_ab_us = {}
info_kb = InlineKeyboardMarkup()
def fill_iau(di:dict):
    global info_kb
    info_kb = InlineKeyboardMarkup()
    number = 0
    for ob in di:
        cb_data = "iau"+str(number)
        info_ab_us[cb_data] = di[ob]
        info_kb.add(InlineKeyboardButton(ob, callback_data=cb_data))
        number += 1

info_all_vacs = {}
all_vacs_kb = InlineKeyboardMarkup()
def fill_all_vacs():
    global all_vacs_kb
    number = 0

#_______________________________________________________
#=================SHORT=FUNCS===========================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
async def send_msg(u_msg: types.Message, msg: str, kb: types.reply_keyboard = None):
    if kb != None:
        if kb != -1:
            await bot.send_message(u_msg.from_user.id, msg, reply_markup=kb)
        else:
            await bot.send_message(u_msg.from_user.id, msg, reply_markup=types.ReplyKeyboardRemove())
    else:
        await bot.send_message(u_msg.from_user.id, msg)

async def change_state(msg: types.Message, stt):
    state = dp.current_state(user=msg.from_user.id)
    await state.set_state(stt)

async def answer(call: types.CallbackQuery, text: str):
    await call.message.answer(text)
    await call.answer()

async def answer_popup(call: types.CallbackQuery, Text: str):
    await call.answer(text=Text, show_alert=True)

#_______________________________________________________
#=================CALLBACK=HANDLERS=====================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
@dp.callback_query_handler(state ='*')
async def send_random_value(call: types.CallbackQuery):
    case = call.data
    if case in info_ab_us:
        await answer(call, info_ab_us[case])

#_______________________________________________________
#=================MESSAGE=HANDLERS======================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
@dp.message_handler(state='*',commands=['start'])
async def proc_start_com(msg: types.Message):
    await send_msg(msg, "Приветствую!", hub_kb)
    await change_state(msg, states.HUB)

@dp.message_handler(state='*')#states.HUB
async def proc_hub_talk(msg: types.Message):
    if msg.text == "Расскажи мне про вашу компанию":
        await send_msg(msg, "Что именно вы хотите узнать?", info_kb)
    elif msg.text == "Хочу работать у вас":
        await send_msg(msg, "Предлагаемые вакансии:", all_vacs_kb)
        #await change_state(msg, states.INTERVIEW)

##@dp.message_handler(state='*',commands=['set'])
##async def process_set_command(msg: types.Message):
##    state = dp.current_state(user=msg.from_user.id)
##    await state.set_state(tss.all()[int(msg.text[5])])
##    await state.update_data(star='Sun')
##
##@dp.message_handler(state=tss.TS1|tss.TS2,commands=['get'])
##async def process_get_command(msg: types.Message):
##    state = dp.current_state(user=msg.from_user.id)
##    text = await state.get_state()
##    if text == None:
##        text = '_'
##    dick = await state.get_data()
##    await msg.reply(dick['star'])

async def shutdown(dispatcher: Dispatcher):
    await dispatcher.storage.close()
    await dispatcher.storage.wait_closed()

if __name__ == '__main__':
    fill_iau({"Вопрос 1":"Ответ 1","Вопрос 2":"Ответ 2", "Вопрос 3":"Ответ 3"})
    executor.start_polling(dp, on_shutdown=shutdown)
