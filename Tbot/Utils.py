import aiogram.utils.exceptions
import ipaddress

import GlobalStuff
from GlobalStuff import CachedDB, BotStuff, Keyboards
import configparser
from ConnectionService import Clienting
import Validation

from aiogram.dispatcher import Dispatcher
from aiogram import Bot
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.contrib.middlewares.logging import LoggingMiddleware
from aiogram import types
from aiogram.dispatcher.filters.state import State, StatesGroup


def getPhrases() -> None:
    config = configparser.ConfigParser()
    config.read("phrases.ini", encoding="utf-8")
    try:
        for step in range(len(GlobalStuff.Phrases.main_info_phrases)):
            GlobalStuff.Phrases.main_info_phrases[step]["R"] = config["step"+str(step)]["R"].replace("_", " ")
            GlobalStuff.Phrases.main_info_phrases[step]["F"] = config["step"+str(step)]["F"].replace("_", " ")
            if step == 5:
                GlobalStuff.Phrases.main_info_phrases[step]["A"] = config["step"+str(step)]["A"].replace("_", " ")
        for phrase in GlobalStuff.Phrases.mistake_phrases:
            GlobalStuff.Phrases.mistake_phrases[phrase] = config["talk"][phrase]
        for phrase in GlobalStuff.Phrases.talk_phrases:
            GlobalStuff.Phrases.talk_phrases[phrase] = config["talk"][phrase]
        for phrase in GlobalStuff.Phrases.talk_commands:
            GlobalStuff.Phrases.talk_commands[phrase] = config["talk_commands"][phrase]
        print("Phrases config is done.")
    except KeyError:
        print("Phrases config error: File structure is invalid.")
        exit()


def getConfig() -> None:
    config = configparser.ConfigParser()
    config.read("settings.ini")
    try:
        GlobalStuff.Conn.token = config["main"]["token"]

        GlobalStuff.Conn.server_ip = config["main"]["server_ip"]
        ipaddress.ip_address(GlobalStuff.Conn.server_ip.split(":")[0])
        GlobalStuff.Conn.bot_ip = config["main"]["bot_ip"]
        ipaddress.ip_address(GlobalStuff.Conn.bot_ip.split(":")[0])

        GlobalStuff.Conn.calendar_server_ip = config["calendar"]["server_ip"]
        ipaddress.ip_address(GlobalStuff.Conn.calendar_server_ip.split(":")[0])
        GlobalStuff.Conn.calendar_bot_ip = config["calendar"]["bot_ip"]
        ipaddress.ip_address(GlobalStuff.Conn.calendar_bot_ip.split(":")[0])

        print("Network config is done.")
    except KeyError:
        print("Network config error: File structure is invalid.")
        exit()
    except ValueError:
        print("Network config error: Invalid ip address.")
        exit()


def setupBot() -> None:
    try:
        BotStuff.bot = Bot(token=GlobalStuff.Conn.token)
        BotStuff.dp = Dispatcher(BotStuff.bot, storage=MemoryStorage())
        BotStuff.dp.middleware.setup(LoggingMiddleware())
        print("Bot setup is done.")
    except aiogram.utils.exceptions.ValidationError:
        print("Token is invalid.")
        exit()


class BotStates(StatesGroup):
    Hub: State = State()
    VacancyChoice: State = State()
    CheckPrivacy: State = State()
    InterviewMainChange: State = State()
    InterviewMain: State = State()
    InterviewFormAsk: State = State()
    InterviewFormYN: State = State()
    InterviewFormAnswer: State = State()
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
        def getState(msg) -> aiogram.dispatcher.storage.FSMContext:
            return BotStuff.dp.current_state(user=msg.from_user.id)

        @staticmethod
        async def initUser(msg) -> None:
            state = Shortcuts.User.getState(msg)
            candidate = Clienting.getCandidateInfo(msg.from_user.id)
            if candidate.tg_id != msg.from_user.id:
                candidate.first_time = True
                candidate.tg_id = msg.from_user.id
            else:
                candidate.first_time = False
            await state.update_data(candidate=candidate)
            await state.update_data(vac_to_int=-1)
            await state.update_data(step=0)

        @staticmethod
        async def setVTI(msg, num: int = -1) -> None:
            state = Shortcuts.User.getState(msg)
            await state.update_data(vac_to_int=num)

        @staticmethod
        async def getVTI(msg) -> int:
            state = Shortcuts.User.getState(msg)
            return (await state.get_data())["vac_to_int"]

        @staticmethod
        async def isUserNotEmpty(msg) -> bool:
            state = Shortcuts.User.getState(msg)
            candidate: GlobalStuff.Candidate = (await state.get_data())["candidate"]
            return candidate.mainInfoEmpty() is None

        @staticmethod
        async def firstTime(msg) -> bool:
            state = Shortcuts.User.getState(msg)
            candidate = (await state.get_data())["candidate"]
            return candidate.first_time

        @staticmethod
        async def send(msg) -> None:
            state = Shortcuts.User.getState(msg)
            candidate = (await state.get_data())["candidate"]
            print(candidate)
            Clienting.sendCandidateInfo(candidate)

    class Messages:
        @staticmethod
        async def send_msg(u_msg, msg: str, kb=None) -> None:
            if kb is not None:
                if kb != -1:
                    await BotStuff.bot.send_message(u_msg.from_user.id, msg, reply_markup=kb)
                else:
                    await BotStuff.bot.send_message(u_msg.from_user.id, msg, reply_markup=types.ReplyKeyboardRemove())
            else:
                await BotStuff.bot.send_message(u_msg.from_user.id, msg)

        @staticmethod
        async def answer(call: types.CallbackQuery, text: str) -> None:
            await call.message.answer(text)
            await call.answer()

        @staticmethod
        async def answer_popup(call: types.CallbackQuery, text: str) -> None:
            await call.answer(text=text, show_alert=True)

        @staticmethod
        def compare_message(msg: str, to: str) -> bool:
            return msg.lower().replace(" ", "") == to.lower().replace(" ", "")

    class Interview:
        class MainInfoTalk:
            @staticmethod
            async def mainInfoAsk(call, first: bool = False) -> None:
                state = Shortcuts.User.getState(call)
                if first:
                    await state.update_data(step=0)
                candidate = (await state.get_data())["candidate"]
                step = int((await state.get_data())["step"])

                if step < candidate.get_main_info_length():
                    if candidate.main_info(step)[1] != "":
                        if not (candidate.main_info(step)[0] == "external_resumes" and candidate.external_resumes == "<!>"):
                            await Shortcuts.Messages.send_msg(call,
                                                              candidate.main_info(step)[1] +
                                                              GlobalStuff.Phrases.main_info_phrases[step]["R"],
                                                              Keyboards.yesno_kb)
                        else:
                            await Shortcuts.Messages.send_msg(call,
                                                              GlobalStuff.Phrases.main_info_phrases[step]["A"],
                                                              Keyboards.yesno_kb)
                    else:
                        await Shortcuts.Messages.send_msg(call, GlobalStuff.Phrases.main_info_phrases[step]["F"])

            @staticmethod
            async def mainInfoAnswer(msg) -> bool:
                state = Shortcuts.User.getState(msg)
                candidate = (await state.get_data())["candidate"]
                step = int((await state.get_data())["step"])
                if candidate.main_info(step)[0] == "external_resumes" and candidate.external_resumes == "<!>":
                    if Shortcuts.Messages.compare_message(msg.text, GlobalStuff.Phrases.talk_commands["yes"]):
                        candidate.main_info_set(step, "")
                        await state.update_data(candidate=candidate)
                        return False
                else:
                    if candidate.main_info(step)[1] != "":
                        if Shortcuts.Messages.compare_message(msg.text, GlobalStuff.Phrases.talk_commands["no"]):
                            candidate.main_info_set(step, "")
                            await state.update_data(candidate=candidate)
                            return False
                    else:
                        if step == 1 and not Validation.is_valid_date(msg.text):
                            await Shortcuts.Messages.send_msg(msg, GlobalStuff.Phrases.mistake_phrases["mistake"])
                            return False
                        if step != 1 and not Validation.is_valid_str(msg.text):
                            await Shortcuts.Messages.send_msg(msg, GlobalStuff.Phrases.mistake_phrases["too_long"])
                            return False
                        candidate.main_info_set(step, msg.text)
                step += 1
                await state.update_data(step=step)
                await state.update_data(candidate=candidate)
                return step >= candidate.get_main_info_length()

        class FreeFormTalk:
            @staticmethod
            async def freeFormAsk(call, first: bool = False) -> bool:
                state = Shortcuts.User.getState(call)
                if first:
                    await state.update_data(step=0)
                candidate = (await state.get_data())["candidate"]
                step = int((await state.get_data())["step"])
                if len(CachedDB.form_to_vac[0]) > step:
                    form = CachedDB.form_to_vac[0][step]
                    await Shortcuts.Messages.send_msg(call, CachedDB.all_forms[form])
                    if form in candidate.forms:
                        await Shortcuts.Messages.send_msg(call, GlobalStuff.Phrases.talk_phrases["is_actual"] + candidate.forms[form], Keyboards.yesno_kb)
                    else:
                        await Shortcuts.Messages.send_msg(call, GlobalStuff.Phrases.talk_phrases["want_form"], Keyboards.yesno_kb)
                    return True
                else:
                    return False

            @staticmethod
            async def freeFormYN(call) -> bool:
                state = Shortcuts.User.getState(call)
                step = int((await state.get_data())["step"])
                candidate = (await state.get_data())["candidate"]
                form = CachedDB.form_to_vac[0][step]
                case1: bool = form not in candidate.forms and Shortcuts.Messages.compare_message(call.text, GlobalStuff.Phrases.talk_commands["yes"])
                case2: bool = form in candidate.forms and Shortcuts.Messages.compare_message(call.text, GlobalStuff.Phrases.talk_commands["no"])
                if case1 or case2:
                    if case2:
                        candidate.forms.pop(form)
                        await Shortcuts.Messages.send_msg(call, GlobalStuff.Phrases.talk_phrases["make_actual"])
                    else:
                        await Shortcuts.Messages.send_msg(call, GlobalStuff.Phrases.talk_phrases["form_fill"])
                    return True
                else:
                    step += 1
                    await state.update_data(step=step)
                    return False

            @staticmethod
            async def freeFormAnswer(call) -> bool:
                state = Shortcuts.User.getState(call)
                candidate = (await state.get_data())["candidate"]
                step = int((await state.get_data())["step"])
                if len(CachedDB.form_to_vac[0]) > step:
                    form = CachedDB.form_to_vac[0][step]
                    candidate.forms[form] = call.text
                    step += 1
                    await state.update_data(step=step)
                    await state.update_data(candidate=candidate)
                return step >= len(CachedDB.form_to_vac[0])

        class ReqTalk:
            @staticmethod
            async def reqAsk(call, first: bool = False) -> None:
                state = Shortcuts.User.getState(call)
                if first:
                    await state.update_data(step=0)
                vti = int((await state.get_data())["vac_to_int"])
                candidate = (await state.get_data())["candidate"]
                step = int((await state.get_data())["step"])
                if len(CachedDB.form_to_vac[vti]) > step:
                    form = CachedDB.form_to_vac[vti][step]
                    await Shortcuts.Messages.send_msg(call, CachedDB.all_forms[form])
                    if form in candidate.forms:
                        await Shortcuts.Messages.send_msg(call, GlobalStuff.Phrases.talk_phrases["is_actual"] + candidate.forms[form], Keyboards.yesno_kb)

            @staticmethod
            async def reqAnswer(msg) -> bool:
                state = Shortcuts.User.getState(msg)
                vti = int((await state.get_data())["vac_to_int"])
                candidate = (await state.get_data())["candidate"]
                step = int((await state.get_data())["step"])
                if len(CachedDB.form_to_vac[vti]) > step:
                    form = CachedDB.form_to_vac[vti][step]
                    if form in candidate.forms:
                        if Shortcuts.Messages.compare_message(msg.text, GlobalStuff.Phrases.talk_commands["yes"]):
                            step += 1
                        else:
                            candidate.forms.pop(form)
                            await Shortcuts.Messages.send_msg(msg, GlobalStuff.Phrases.talk_phrases["make_actual"])
                    else:
                        candidate.forms[form] = msg.text
                        step += 1
                    await state.update_data(step=step)
                    await state.update_data(candidate=candidate)
                return step >= len(CachedDB.form_to_vac[vti])

        @staticmethod
        async def endOfInterview(msg) -> None:
            state = Shortcuts.User.getState(msg)
            candidate = (await state.get_data())["candidate"]
            candidate.wantedVacancy = await Shortcuts.User.getVTI(msg)
            await state.update_data(candidate=candidate)
            await Shortcuts.User.setVTI(msg)


async def shutdown(dispatcher: Dispatcher):
    await dispatcher.storage.close()
    await dispatcher.storage.wait_closed()
