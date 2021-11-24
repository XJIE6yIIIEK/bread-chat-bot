import GlobalStuff
from GlobalStuff import CachedDB, BotStuff, Keyboards
import configparser
import ConnectionService
import Validation

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
    InterviewMainChange: State = State()
    InterviewMain: State = State()
    InterviewVac: State = State()


async def SetBotCommands() -> None:
    await BotStuff.dp.bot.set_my_commands([
        types.BotCommand("start", "Запустить бота"),
        types.BotCommand("help", "Помощь"),
        types.BotCommand("change", "Изменить основную информацию о себе")
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
            candidate.tg_id = msg.from_user.id
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
            print(candidate)
            ConnectionService.Clienting.sendCandidateInfo(candidate)

    class Messages:
        @staticmethod
        async def send_msg(u_msg, msg: str, kb=None):
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
        main_info_phrases = [{"R": " - Ваше полное имя?", "F": "Укажите Ваше полное имя:"},
                             {"R": " - Ваша дата рождения?", "F": "Укажите вашу дату рождения в формате ГГГГ-ММ-ДД:"},
                             {"R": " - Ваш номер телефона?", "F": "Укажите ваш номер телефона:"},
                             {"R": " - Ваш адрес?", "F": "Укажите ваш адрес:"},
                             {"R": " - Ваша электронная почта?", "F": "Укажите вашу электронную почту:"}]

        @staticmethod
        async def mainInfoAsk(call, first: bool = False):
            state = BotStuff.dp.current_state(user=call.from_user.id)
            if first:
                await state.update_data(step=0)
            step = int((await state.get_data())["step"])
            candidate = (await state.get_data())["candidate"]

            if step < 5:
                if candidate.main_info(step)[1] != "":
                    await Shortcuts.Messages.send_msg(call,
                                                      candidate.main_info(step)[1]+
                                                      Shortcuts.Interview.main_info_phrases[step]["R"],
                                                      Keyboards.yesno_kb)
                else:
                    await Shortcuts.Messages.send_msg(call, Shortcuts.Interview.main_info_phrases[step]["F"])

        @staticmethod
        async def mainInfoAnswer(msg) -> bool:
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            candidate = (await state.get_data())["candidate"]
            step = int((await state.get_data())["step"])
            if candidate.main_info(step)[1] != "":
                if msg.text == "Нет":
                    candidate.main_info_set(step, "")
                    await state.update_data(candidate=candidate)
                    return False
            else:
                if step == 1:
                    if not Validation.is_valid_date(msg.text):
                        await Shortcuts.Messages.send_msg(msg, "Пожалуйста,указывайте действительную информацию.")
                        return False
                candidate.main_info_set(step, msg.text)
            step += 1
            await state.update_data(step=step)
            await state.update_data(candidate=candidate)
            return step >= 5

        @staticmethod
        async def reqAsk(call, first: bool = False):
            state = Shortcuts.User.getState(call)
            if first:
                await state.update_data(step=0)
            vti = int((await state.get_data())["vac_to_int"])
            candidate = (await state.get_data())["candidate"]
            step = int((await state.get_data())["step"])
            if len(CachedDB.req_to_vac[vti]) > step:
                requirement = CachedDB.req_to_vac[vti][step]
                await Shortcuts.Messages.send_msg(call, CachedDB.all_reqs[requirement])
                if requirement in candidate.reqs:
                    await Shortcuts.Messages.send_msg(call, "Актуален ли ваш последний ответ: \""+candidate.reqs[requirement]+"\" ?", Keyboards.yesno_kb)

        @staticmethod
        async def reqAnswer(msg) -> bool:
            state = BotStuff.dp.current_state(user=msg.from_user.id)
            vti = int((await state.get_data())["vac_to_int"])
            candidate = (await state.get_data())["candidate"]
            step = int((await state.get_data())["step"])
            if len(CachedDB.req_to_vac[vti]) > step:
                requirement = CachedDB.req_to_vac[vti][step]
                if requirement in candidate.reqs:
                    if msg.text == "Да":
                        step += 1
                    else:
                        candidate.reqs.pop(requirement)
                        await Shortcuts.Messages.send_msg(msg, "Укажите актуальную информацию")
                else:
                    candidate.reqs[requirement] = msg.text
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
