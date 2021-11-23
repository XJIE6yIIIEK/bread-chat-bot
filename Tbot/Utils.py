import GlobalStuff
from GlobalStuff import CachedDB, BotStuff, Keyboards
import configparser
import ConnectionService

from aiogram.dispatcher import Dispatcher
from aiogram import Bot
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.contrib.middlewares.logging import LoggingMiddleware
from aiogram import types
from aiogram.dispatcher.filters.state import State, StatesGroup


def getConfig() -> None:
    config = configparser.ConfigParser()
    config.read("settings.ini")
    try:
        GlobalStuff.Conn.token = config["S"]["token"]
        GlobalStuff.Conn.server_ip = config["S"]["server_ip"]
        GlobalStuff.Conn.bot_ip = config["S"]["bot_ip"]
    except KeyError:
        print("Config error.")
        exit()


def setupBot() -> None:
    BotStuff.bot = Bot(token=GlobalStuff.Conn.token)
    BotStuff.dp = Dispatcher(BotStuff.bot, storage=MemoryStorage())
    BotStuff.dp.middleware.setup(LoggingMiddleware())


class BotStates(StatesGroup):
    Hub: State = State()
    VacancyChoice: State = State()
    InterviewMain: State = State()
    InterviewVac: State = State()


async def SetBotCommands() -> None:
    await BotStuff.dp.bot.set_my_commands([
        types.BotCommand("start", "Запустить бота"),
        types.BotCommand("help", "Помощь"),
        types.BotCommand("change", "Изменить основную информацию о себе"),
        types.BotCommand("info", "информация о боте")
    ])


class Shortcuts:
    class User:
        @staticmethod
        def getState(msg):
            return BotStuff.dp.current_state(user=msg.from_user.id)

        @staticmethod
        async def initUser(msg) -> None:
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            candidate = ConnectionService.Clienting.getCandidateInfo(msg.from_user.id)
            await state.update_data(candidate=candidate)
            await state.update_data(vac_to_int=-1)
            await state.update_data(step=0)

        @staticmethod
        async def setVTI(msg, num: int = -1) -> None:
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            await state.update_data(vac_to_int=num)

        @staticmethod
        async def getVTI(msg) -> int:
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            return (await state.get_data())["vac_to_int"]

        @staticmethod
        async def isUserNotEmpty(msg) -> bool:
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            candidate: GlobalStuff.Candidate = (await state.get_data())["candidate"]
            return candidate.mainInfoEmpty() is None

        @staticmethod
        async def send(msg):
            state = Shortcuts.User.getState(msg)
            candidate = (await state.get_data())["candidate"]
            ConnectionService.Clienting.sendCandidateInfo(candidate)

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
        async def mainInfoAsk(call):
            state = BotStuff.dp.current_state(user=call.from_user.id)
            candidate = (await state.get_data())["candidate"]
            if candidate.name == "":
                await Shortcuts.Messages.send_msg(call, "Укажите Ваше полное имя:")
            elif candidate.birth == "":
                await Shortcuts.Messages.send_msg(call, "Укажите вашу дату рождения в формате ГГГГ-ММ-ДД:")
            elif candidate.phone == "":
                await Shortcuts.Messages.send_msg(call, "Укажите ваш телефонный номер:")
            elif candidate.address == "":
                await Shortcuts.Messages.send_msg(call, "Укажите ваш адрес:")
            elif candidate.mail == "":
                await Shortcuts.Messages.send_msg(call, "Укажите вашу электронную почту:")

        @staticmethod
        async def mainInfoAnswer(msg):
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            candidate = (await state.get_data())["candidate"]
            case = candidate.mainInfoEmpty()
            if case == "name":
                candidate.name = msg.text
            elif case == "birth":
                candidate.birth = msg.text
            elif case == "phone":
                candidate.phone = msg.text
            elif case == "address":
                candidate.address = msg.text
            elif case == "mail":
                candidate.mail = msg.text
            await state.update_data(candidate=candidate)

        @staticmethod
        async def reqAsk(call, first:bool = False):
            state = Shortcuts.User.getState(call)
            if first:
                await state.update_data(step=0)
            vti = int((await state.get_data())["vac_to_int"])
            candidate = (await state.get_data())["candidate"]
            step = int((await state.get_data())["step"])
            if len(CachedDB.req_to_vac[vti]) > step:
                reqn = CachedDB.req_to_vac[vti][step]
                await Shortcuts.Messages.send_msg(call, CachedDB.all_reqs[reqn])
                if reqn in candidate.reqs:
                    await Shortcuts.Messages.send_msg(call, "Ваш ответ: \""+candidate.reqs[reqn]+"\" ?", Keyboards.yesno_kb)

        @staticmethod
        async def reqAnswer(msg) -> bool:
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            vti = int((await state.get_data())["vac_to_int"])
            candidate = (await state.get_data())["candidate"]
            step = int((await state.get_data())["step"])
            if len(CachedDB.req_to_vac[vti]) > step:
                reqn = CachedDB.req_to_vac[vti][step]
                if reqn in candidate.reqs:
                    if msg.text == "Да":
                        step += 1
                    else:
                        candidate.reqs.pop(reqn)
                        await Shortcuts.Messages.send_msg(msg, "Укажите актуальную информацию:")
                else:
                    candidate.reqs[reqn] = msg.text
                    step += 1
                await state.update_data(step=step)
                await state.update_data(candidate=candidate)
            return step >= len(CachedDB.req_to_vac[vti])

        @staticmethod
        async def endOfInterview(msg):
            state = Shortcuts.User.getState(msg)
            await state.update_data(interview=0)


async def shutdown(dispatcher: Dispatcher):
    await dispatcher.storage.close()
    await dispatcher.storage.wait_closed()
