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

import configparser

#init data
TOKEN = None
ClientTo = None
ServerTo = None
channel = None
stub = None

def getConfig():
    config = configparser.ConfigParser()
    config.read("settings.ini")
    global TOKEN
    global ClientTo
    global ServerTo
    try:
        TOKEN = config["S"]["token"]
        ClientTo = config["S"]["ClientTo"]
        ServerTo = config["S"]["ServerTo"]
    except KeyError:
        print("Config error.")
        exit()
getConfig()
#DB cached
info_ab_us = {}
all_vacs = {}
all_reqs = {}
req_to_vac = {}

#Keyboards
info_kb = InlineKeyboardMarkup()
vacs_kb = InlineKeyboardMarkup()
yesno_kb = InlineKeyboardMarkup()
yesno2_kb = ReplyKeyboardMarkup(resize_keyboard=True,one_time_keyboard=True)
hub_kb = ReplyKeyboardMarkup(resize_keyboard=True)


#Bot and dispatcher
bot = Bot(token=TOKEN)
dp = Dispatcher(bot, storage=MemoryStorage())
dp.middleware.setup(LoggingMiddleware())


class Candidate():
    name:str = ""
    birth:str = ""
    phone:str = ""
    address:str = ""
    mail:str = ""
    tg_id:str = ""
    reqs:dict = {}
    def mainInfoEmpty(self):
        if self.name == "":
            return "name"
        if self.birth == "":
            return "birth"
        if self.phone == "":
            return "phone"
        if self.address == "":
            return "address"
        if self.mail == "":
            return "mail"
        return None

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

        def sendCandidateInfo(cand: Candidate):
            mainInfo = pb2.Candidate(s_name=cand.name, d_birth_date=cand.birth,s_phone_number=cand.phone,s_address=cand.address,e_mail=cand.mail,s_tg_id=str(cand.tg_id))
            resumes = []
            for ob in cand.reqs:
                resumes.append(pb2.CandidateResume(n_requirement=ob,s_value=cand.reqs[ob]))
            stub.sendCandidateInfo(pb2.CandidateRequest(candidateMainInfo=mainInfo, candidateResumes=resumes))
        
        def getCandidateInfo(TGid) -> Candidate:
            cand = stub.getCandidateInfo(pb2.TgId(s_tg_id = str(TGid)))
            out = Candidate()

            out.name = cand.candidateMainInfo.s_name
            out.birth = cand.candidateMainInfo.d_birth_date
            out.phone = cand.candidateMainInfo.s_phone_number
            out.address = cand.candidateMainInfo.s_address
            out.mail = cand.candidateMainInfo.e_mail
            out.tg_id = cand.candidateMainInfo.s_tg_id
            
            for ob in cand.candidateResumes:
                out.reqs[ob.n_requirement] = ob.s_value

            return out


    class Servering():
        class ServClass(pb2_g.BotServiceServicer):
            def infoUpdated(self, request, context):
                if request.info.s_name in info_ab_us and info_ab_us[request.info.s_name] == request.info.s_message:
                    info_ab_us.pop(request.info.s_name)
                else:
                    info_ab_us[request.info.s_name] = request.info.s_message
                KeyboardsService.fillInfoKb()
                return pb2.Empty()

            def requirementUpdated(self, request, context):
                if request.requirement.id in all_reqs and all_reqs[request.requirement.id] == request.requirement.s_name:
                    all_reqs.pop(request.requirement.id)
                else:
                    all_reqs[request.requirement.id] = request.requirement.s_name
                return pb2.Empty()

            def vacancyUpdated(self, request, context):
                if request.vacancy.id in all_vacs and all_vacs[request.vacancy.id] == request.vacancy.s_name:
                    all_vacs.pop(request.vacancy.id)
                else:
                    all_vacs[request.vacancy.id] = request.vacancy.s_name
                KeyboardsService.fillVacsKb()
                return pb2.Empty()

            def reqToVacUpdated(self, request, context):
                vac_id = request.vacancyRequirement.n_vacancy
                req_id = request.vacancyRequirement.n_requirement
                if request.delete:
                    if vac_id in req_to_vac and req_id in req_to_vac[vac_id]:
                        req_to_vac[vac_id].pop(req_to_vac[vac_id].index(req_id))
                        if len(req_to_vac[vac_id]) == 0:
                            req_to_vac.pop(vac_id)
                else:
                    if vac_id in req_to_vac:
                        if not req_id in req_to_vac[vac_id]:
                            req_to_vac[vac_id].append(vac_id)
                    else:
                        req_to_vac[vac_id] = [req_id]
                print(req_to_vac)
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
        info_kb = InlineKeyboardMarkup()
        for ob in info_ab_us:
            info_kb.add(InlineKeyboardButton(ob, callback_data="iau:"+str(ob)))

    def fillVacsKb():
        global vacs_kb
        vacs_kb = InlineKeyboardMarkup()
        for ob in all_vacs:
            vacs_kb.add(InlineKeyboardButton(all_vacs[ob], callback_data="vac:"+str(ob)))

    def fillYesnoKb():
        global yesno_kb
        yesno_kb = InlineKeyboardMarkup()
        yesno_kb.add(InlineKeyboardButton("Да", callback_data="yon:YES"))
        yesno_kb.add(InlineKeyboardButton("Нет", callback_data="yon:NO"))

    def fillReplyKbs():
        hub_kb.add(KeyboardButton('Расскажи мне про вашу компанию'))
        hub_kb.add(KeyboardButton('Хочу работать у вас'))
        yesno2_kb.add(KeyboardButton("Да"))
        yesno2_kb.add(KeyboardButton("нет"))

#_______________________________________________________
#=================SHORT=FUNCS===========================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
async def send_msg(u_msg, msg: str, kb = None):#types.reply_keyboard
    if kb != None:
        if kb != -1:
            await bot.send_message(u_msg.from_user.id, msg, reply_markup=kb)
        else:
            await bot.send_message(u_msg.from_user.id, msg, reply_markup=types.ReplyKeyboardRemove())
    else:
        await bot.send_message(u_msg.from_user.id, msg)

async def answer(call: types.CallbackQuery, text: str):
    await call.message.answer(text)
    await call.answer()

async def answer_popup(call: types.CallbackQuery, Text: str):
    await call.answer(text=Text, show_alert=True)

async def isInInterview(msg):
    state = dp.current_state(user=msg.from_user.id)
    data = await state.get_data()
    if "interview" in data:
        return (data["interview"] != 0)
    else:
        return False

async def get_vac_to_int(msg):
    state = dp.current_state(user=msg.from_user.id)
    data = await state.get_data()
    if "vac_to_int" in data:
        return data["vac_to_int"]
    else:
        return -1

async def initUser(call):
    state = dp.current_state(user=call.from_user.id)
    if not "candidate" in (await state.get_data()):
        cand = ConnectionService.Clienting.getCandidateInfo(call.from_user.id)
        await state.update_data(candidate=cand)

async def mainInfoAsk(call):
    state = dp.current_state(user=call.from_user.id)
    cand = (await state.get_data())["candidate"]
    if cand.name == "":
        await send_msg(call, "Укажите Ваше полное имя:")
    elif cand.birth == "":
        await send_msg(call, "Укажите вашу дату рождения в формате ГГГГ-ММ-ДД:")
    elif cand.phone == "":
        await send_msg(call, "Укажите ваш телефонный номер:")
    elif cand.address == "":
        await send_msg(call, "Укажите ваш адрес:")
    elif cand.mail == "":
        await send_msg(call, "Укажите вашу электронную почту:")

async def mainInfoAnswer(msg):
    state = dp.current_state(user=msg.from_user.id)
    cand = (await state.get_data())["candidate"]
    case = cand.mainInfoEmpty()
    if case == "name":
        cand.name = msg.text
    elif case == "birth":
        cand.birth = msg.text
    elif case == "phone":
        cand.phone = msg.text
    elif case == "address":
        cand.address = msg.text
    elif case == "mail":
        cand.mail = msg.text
        if (await get_vac_to_int(msg)) == -1:
            await state.update_data(interview=0)
        else:
            await state.update_data(interview=1)
    await state.update_data(candidate=cand)

async def reqAsk(call):
    state = dp.current_state(user=call.from_user.id)
    vti = int((await state.get_data())["vac_to_int"])
    cand = (await state.get_data())["candidate"]
    step = int((await state.get_data())["step"])
    if len(req_to_vac[vti]) > step:
        reqn = req_to_vac[vti][step]
        await send_msg(call, all_reqs[reqn])
        if reqn in cand.reqs:
            await send_msg(call, "Ваш ответ: \""+cand.reqs[reqn]+"\" ?", yesno2_kb)

async def reqAnswer(msg):
    state = dp.current_state(user=msg.from_user.id)
    vti = int((await state.get_data())["vac_to_int"])
    cand = (await state.get_data())["candidate"]
    step = int((await state.get_data())["step"])
    if len(req_to_vac[vti]) > step:
        reqn = req_to_vac[vti][step]
        if reqn in cand.reqs:
            if msg.text == "Да":
                step += 1
            else:
                cand.reqs.pop(reqn)
        else:
            cand.reqs[reqn] = msg.text
            step += 1
        await state.update_data(step=step)
        await state.update_data(candidate=cand)
        if step >= len(req_to_vac[vti]):
            await state.update_data(vac_to_int=-1)
            await state.update_data(interview=0)
            ConnectionService.Clienting.sendCandidateInfo(cand)
            await send_msg(msg, "Интервью закончено.", hub_kb)
        else:
            await reqAsk(msg)

#_______________________________________________________
#=================CALLBACK=HANDLERS=====================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
@dp.callback_query_handler(state ='*')
async def button_pressed(call: types.CallbackQuery):
    case = call.data[0:4]
    key = call.data[4:]
    state = dp.current_state(user=call.from_user.id)
    if case == "iau:":
        if key in info_ab_us:
            await answer(call, info_ab_us[key])
        else:
            await answer(call, "Эта информация больше недоступна.")
    elif case == "vac:":
        await call.answer()
        await state.update_data(vac_to_int=key)
        await send_msg(call, "Ваш выбор - " + all_vacs[int(key)], yesno_kb)
    elif case == "yon:":
        if key == "YES":
            candInfo = ConnectionService.Clienting.getCandidateInfo(call.from_user.id)
            candInfo.tg_id = call.from_user.id
            await state.update_data(candidate=candInfo)

            if candInfo.mainInfoEmpty() == None:
                await state.update_data(interview=1)
                await state.update_data(step=0)
                await call.answer()
                await send_msg(call, "Прекрасно! Информация по вакансии.", -1)
                await reqAsk(call)
            else:
                await state.update_data(interview=-1)
                await state.update_data(step=0)
                await call.answer()
                await send_msg(call, "Прекрасно! Для начала, основная информация.", -1)
                await mainInfoAsk(call)
        else:
            pass

#_______________________________________________________
#=================MESSAGE=HANDLERS======================
#‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
@dp.message_handler(state='*',commands=['start'])
async def proc_start_com(msg: types.Message):
    await initUser(msg)
    await send_msg(msg, "Приветствую!", hub_kb)

@dp.message_handler(state='*')
async def proc_talk(msg: types.Message):
    await initUser(msg)
    if await isInInterview(msg):
        state = dp.current_state(user=msg.from_user.id)
        if (await state.get_data())["interview"] == -1:
            await mainInfoAnswer(msg)
            if (await state.get_data())["candidate"].mainInfoEmpty() != None:
                await mainInfoAsk(msg)
            else:
                if (await state.get_data())["interview"] == 1:
                    await reqAsk(msg)
        else:
            await reqAnswer(msg)
    else:
        if msg.text == "Расскажи мне про вашу компанию":
            await send_msg(msg, "Что именно вы хотите узнать?", info_kb)
        elif msg.text == "Хочу работать у вас":
            await send_msg(msg, "Предлагаемые вакансии:", vacs_kb)

async def shutdown(dispatcher: Dispatcher):
    await dispatcher.storage.close()
    await dispatcher.storage.wait_closed()

if __name__ == '__main__':
    try:
        ConnectionService.Clienting.setupClient()
        ConnectionService.Servering.setupServer()

        ConnectionService.Clienting.getCache()
        KeyboardsService.fillInfoKb()
        KeyboardsService.fillVacsKb()
        KeyboardsService.fillYesnoKb()
        KeyboardsService.fillReplyKbs()

        print(info_ab_us)
        print(all_vacs)
        print(all_reqs)
        print(req_to_vac)

        executor.start_polling(dp, on_shutdown=shutdown)
    except grpc.RpcError as rpc_error:
        if rpc_error.code() == grpc.StatusCode.UNAVAILABLE:
            print("Connection failed. *-*")
        else:
            print("Something gone wrong. X_X")
