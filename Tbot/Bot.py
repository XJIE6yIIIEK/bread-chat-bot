from aiogram import Bot, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton
from aiogram.dispatcher import Dispatcher
from aiogram.dispatcher.filters.state import State, StatesGroup
from aiogram.utils import executor
#from aiogram.utils.markdown import text, bold, italic, code, pre
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.contrib.middlewares.logging import LoggingMiddleware

from threading import Thread
from concurrent import futures
import logging
import grpc
import telegramBot_pb2 as pb2
import telegramBot_pb2_grpc as pb2_g

import Ttoken

TOKEN = Ttoken.token
channel = None
stub = None
ClientTo = 'localhost:50051'
ServerTo = 'localhost:50058'

#DB cached
info_ab_us = {}
vacs_list = {}
vacs_reqs = {}

#Keyboards
info_kb = InlineKeyboardMarkup()
all_vacs_kb = InlineKeyboardMarkup()

#_______________________________________________________
#===================CONN=STUFF==========================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
class serving(pb2_g.BotServiceServicer):
    def newInfoAdded(self, request, context):
        print(request)
        return pb2.Empty()

def SetupClient():
    global channel
    global stub
    channel = grpc.insecure_channel(ClientTo)
    stub = pb2_g.BotServiceStub(channel)
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_g.add_BotServiceServicer_to_server(serving(), server)
    server.add_insecure_port(ServerTo)
    server.start()
    server.wait_for_termination()
def SetupServer():
    Thread(target = serve, daemon=True).start()

def getCompanyInfo():
    return stub.getCompanyInfo(pb2.Empty()).companyInfos

def getAllVacancies():
    return stub.getAllVacancies(pb2.Empty()).vacancies

def getVacancyRequirements(id:int):
    return stub.getVacancyRequirements(pb2.VacancyRequirementsRequest(vacancyId = 1)).requirements

#_______________________________________________________
#====================BOT=STUFF==========================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾

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
def FillInfoAboutUs():
    global info_kb
    global info_ab_us
    info_kb = InlineKeyboardMarkup()
    info_ab_us = {}
    for ob in getCompanyInfo():
        cb_data = "iau"+ob.name
        info_ab_us[cb_data] = ob.message
        info_kb.add(InlineKeyboardButton(ob.name, callback_data=cb_data))
    
def FillAllVacs():
    global all_vacs_kb
    global vacs_list
    global vacs_reqs
    all_vacs_kb = InlineKeyboardMarkup()
    vacs_list = {}
    vacs_reqs = {}
    di = getAllVacancies()
    for ob in di:
        cb_data = "iav"+str(ob.id)
        vacs_list[cb_data] = ob
        vacs_reqs[cb_data] = getVacancyRequirements(ob.id)
        all_vacs_kb.add(InlineKeyboardButton(ob.name, callback_data=cb_data))


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
    if case in vacs_list:
        await answer(call, "Отличный выбор!")
        #state = dp.current_state(user=call.from_user.id)
        #await state.update_data("")
        #print(getVacancyRequirements(vacs_list[case].id))

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
    try:
        logging.basicConfig()
        SetupClient()
        SetupServer()

        FillAllVacs()
        FillInfoAboutUs()

        executor.start_polling(dp, on_shutdown=shutdown)
    except grpc.RpcError as rpc_error:
        if rpc_error.code() == grpc.StatusCode.UNAVAILABLE:
            print("Connection failed. *-*")
        else:
            print("Something gone wrong. X_X")
