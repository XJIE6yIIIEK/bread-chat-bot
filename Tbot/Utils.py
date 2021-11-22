import GlobalStuff
from GlobalStuff import CachedDB, BotStuff, Keyboards
import configparser
import ConnectionService

from aiogram.dispatcher import Dispatcher
from aiogram import Bot
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.contrib.middlewares.logging import LoggingMiddleware
from aiogram import types


def getConfig():
    config = configparser.ConfigParser()
    config.read("settings.ini")
    try:
        GlobalStuff.Conn.token = config["S"]["token"]
        GlobalStuff.Conn.server_ip = config["S"]["server_ip"]
        GlobalStuff.Conn.bot_ip = config["S"]["bot_ip"]
    except KeyError:
        print("Config error.")
        exit()


def setupBot():
    BotStuff.bot = Bot(token=GlobalStuff.Conn.token)
    BotStuff.dp = Dispatcher(BotStuff.bot, storage=MemoryStorage())
    BotStuff.dp.middleware.setup(LoggingMiddleware())


class Shortcuts:
    @staticmethod
    async def initUser(call):
        state = BotStuff.dp.current_state(user=call.from_user.id)
        if "candidate" not in (await state.get_data()):
            cand = ConnectionService.Clienting.getCandidateInfo(call.from_user.id)
            await state.update_data(candidate=cand)

    class Messages:
        @staticmethod
        async def send_msg(u_msg, msg: str, kb=None):  # types.reply_keyboard
            if kb is not None:
                if kb != -1:
                    await BotStuff.bot.send_message(u_msg.from_user.id, msg, reply_markup=kb)
                else:
                    await BotStuff.bot.send_message(u_msg.from_user.id, msg, reply_markup=types.ReplyKeyboardRemove())
            else:
                await BotStuff.bot.send_message(u_msg.from_user.id, msg)

        @staticmethod
        async def answer(call: types.CallbackQuery, text: str):
            await call.message.answer(text)
            await call.answer()

        @staticmethod
        async def answer_popup(call: types.CallbackQuery, text: str):
            await call.answer(text=text, show_alert=True)

    class Interview:
        @staticmethod
        async def isInInterview(msg):
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            data = await state.get_data()
            if "interview" in data:
                return data["interview"] != 0
            else:
                return False

        @staticmethod
        async def get_vac_to_int(msg):
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            data = await state.get_data()
            if "vac_to_int" in data:
                return data["vac_to_int"]
            else:
                return -1

        @staticmethod
        async def mainInfoAsk(call):
            state = BotStuff.dp.current_state(user=call.from_user.id)
            cand = (await state.get_data())["candidate"]
            if cand.name == "":
                await Shortcuts.Messages.send_msg(call, "Укажите Ваше полное имя:")
            elif cand.birth == "":
                await Shortcuts.Messages.send_msg(call, "Укажите вашу дату рождения в формате ГГГГ-ММ-ДД:")
            elif cand.phone == "":
                await Shortcuts.Messages.send_msg(call, "Укажите ваш телефонный номер:")
            elif cand.address == "":
                await Shortcuts.Messages.send_msg(call, "Укажите ваш адрес:")
            elif cand.mail == "":
                await Shortcuts.Messages.send_msg(call, "Укажите вашу электронную почту:")

        @staticmethod
        async def mainInfoAnswer(msg):
            state = BotStuff.dp.current_state(user=msg.from_user.id)
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
                if (await Shortcuts.Interview.get_vac_to_int(msg)) == -1:
                    await state.update_data(interview=0)
                else:
                    await state.update_data(interview=1)
            await state.update_data(candidate=cand)

        @staticmethod
        async def reqAsk(call):
            state = BotStuff.dp.current_state(user=call.from_user.id)
            vti = int((await state.get_data())["vac_to_int"])
            cand = (await state.get_data())["candidate"]
            step = int((await state.get_data())["step"])
            if len(CachedDB.req_to_vac[vti]) > step:
                reqn = CachedDB.req_to_vac[vti][step]
                await Shortcuts.Messages.send_msg(call, CachedDB.all_reqs[reqn])
                if reqn in cand.reqs:
                    await Shortcuts.Messages.send_msg(call, "Ваш ответ: \""+cand.reqs[reqn]+"\" ?", Keyboards.yesno2_kb)

        @staticmethod
        async def reqAnswer(msg):
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            vti = int((await state.get_data())["vac_to_int"])
            cand = (await state.get_data())["candidate"]
            step = int((await state.get_data())["step"])
            if len(CachedDB.req_to_vac[vti]) > step:
                reqn = CachedDB.req_to_vac[vti][step]
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
                if step >= len(CachedDB.req_to_vac[vti]):
                    await state.update_data(vac_to_int=-1)
                    await state.update_data(interview=0)
                    ConnectionService.Clienting.sendCandidateInfo(cand)
                    await Shortcuts.Messages.send_msg(msg, "Интервью закончено.", Keyboards.hub_kb)
                else:
                    await Shortcuts.Interview.reqAsk(msg)
