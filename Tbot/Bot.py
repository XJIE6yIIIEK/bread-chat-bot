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

#init data
TOKEN = Ttoken.token
channel = None
stub = None
ClientTo = 'localhost:50051'
ServerTo = 'localhost:50058'

#DB cached
info_ab_us = {}
all_vacs = {}
all_reqs = {}
req_to_vac = {}

#Keyboards
info_kb = InlineKeyboardMarkup()
vacs_kb = InlineKeyboardMarkup()
hub_kb = ReplyKeyboardMarkup(resize_keyboard=True)#one_time_keyboard=True


#Bot and dispatcher
bot = Bot(token=TOKEN)
dp = Dispatcher(bot, storage=MemoryStorage())
dp.middleware.setup(LoggingMiddleware())

#_______________________________________________________
#===================CONN=STUFF==========================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
class ConnectionService():
    class Clienting():
        def setupClient():
            global channel
            global stub
            channel = grpc.insecure_channel(ClientTo)
            stub = pb2_g.BotServiceStub(channel)

        def getCache():
            global info_ab_us
            global all_vacs
            global all_reqs
            global req_to_vac

            cache = stub.getCache(pb2.Empty())

            for ob in cache.vacancies:
                all_vacs[ob.id] = ob.s_name

            for ob in cache.requirements:
                all_reqs[ob.id] = ob.s_name

            for ob in cache.reqToVacs:
                if ob.n_vacancy in req_to_vac:
                    if not ob.n_requirement in req_to_vac[ob.n_vacancy]:
                        req_to_vac[ob.n_vacancy].append(ob.n_requirement)
                else:
                    req_to_vac[ob.n_vacancy] = [ob.n_requirement]

            for ob in cache.companyInfos:
                info_ab_us[ob.s_name] = ob.s_message

    class Servering():
        class ServClass(pb2_g.BotServiceServicer):
            def infoUpdated(self, request, context):
                print(request)
                return pb2.Empty()
            def requirementUpdated(self, request, context):
                print(request)
                return pb2.Empty()
            def vacancyUpdated(self, request, context):
                print(request)
                return pb2.Empty()
            def reqToVacUpdated(self, request, context):
                print(request)
                return pb2.Empty()

        def serve():
            server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
            pb2_g.add_BotServiceServicer_to_server(ConnectionService.Servering.ServClass(), server)
            server.add_insecure_port(ServerTo)
            server.start()
            server.wait_for_termination()

        def setupServer():
            Thread(target = ConnectionService.Servering.serve, daemon=True).start()

class KeyboardsService():

    def fillInfoKb():
        global info_kb
        for ob in info_ab_us:
            info_kb.add(InlineKeyboardButton(ob, callback_data="iau:"+str(ob)))

    def fillVacsKb():
        global vacs_kb
        for ob in all_vacs:
            vacs_kb.add(InlineKeyboardButton(all_vacs[ob], callback_data="vac:"+str(ob)))


#_______________________________________________________
#====================BOT=STUFF==========================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
hub_kb.add(KeyboardButton('Расскажи мне про вашу компанию'))
hub_kb.add(KeyboardButton('Хочу работать у вас'))

class states(StatesGroup):
    HUB = State()
    INFO = State()
    VACS = State()
    INTERVIEW = State()
    ATTACK = State()

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
    case = call.data[0:4]
    key = call.data[4:]
    if case == "iau:":
        await answer(call, info_ab_us[key])
    elif case == "vac:":
        print(all_vacs[int(key)])



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
        await send_msg(msg, "Предлагаемые вакансии:", vacs_kb)
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
    #try:
    ConnectionService.Clienting.setupClient()
    ConnectionService.Servering.setupServer()

    ConnectionService.Clienting.getCache()

    KeyboardsService.fillInfoKb()
    KeyboardsService.fillVacsKb()

    executor.start_polling(dp, on_shutdown=shutdown)
    #except grpc.RpcError as rpc_error:
    #    if rpc_error.code() == grpc.StatusCode.UNAVAILABLE:
    #        print("Connection failed. *-*")
    #    else:
    #        print("Something gone wrong. X_X")
