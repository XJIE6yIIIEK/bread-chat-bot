import aiogram.utils.exceptions
import ipaddress

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


def getPhrases() -> None:
    config = configparser.ConfigParser()
    config.read("phrases.ini", encoding="utf-8")
    try:
        for step in range(len(Shortcuts.Interview.main_info_phrases)):
            Shortcuts.Interview.main_info_phrases[step]["R"] = config["step"+str(step)]["R"].replace("_", " ")
            Shortcuts.Interview.main_info_phrases[step]["F"] = config["step"+str(step)]["F"].replace("_", " ")
            if step == 5:
                Shortcuts.Interview.main_info_phrases[step]["A"] = config["step"+str(step)]["A"].replace("_", " ")
        Shortcuts.Interview.mistake_phrases["mistake"] = config["talk"]["mistake"]
        Shortcuts.Interview.mistake_phrases["too_long"] = config["talk"]["too_long"]
        Shortcuts.Interview.mistake_phrases["no_vacancies"] = config["talk"]["no_vacancies"]
        Shortcuts.Interview.mistake_phrases["old_info"] = config["talk"]["old_info"]
        Shortcuts.Interview.talk_phrases["what_info"] = config["talk"]["what_info"]
        Shortcuts.Interview.talk_phrases["what_vacancy"] = config["talk"]["what_vacancy"]
        Shortcuts.Interview.talk_phrases["is_your_choice"] = config["talk"]["is_your_choice"]
        Shortcuts.Interview.talk_phrases["lets_talk"] = config["talk"]["lets_talk"]
        Shortcuts.Interview.talk_phrases["main_info"] = config["talk"]["main_info"]
        Shortcuts.Interview.talk_phrases["not_choice"] = config["talk"]["not_choice"]
        Shortcuts.Interview.talk_phrases["vacancy_info"] = config["talk"]["vacancy_info"]
        Shortcuts.Interview.talk_phrases["main_info_done"] = config["talk"]["main_info_done"]
        Shortcuts.Interview.talk_phrases["the_end"] = config["talk"]["the_end"]
        Shortcuts.Interview.talk_phrases["is_actual"] = config["talk"]["is_actual"]
        Shortcuts.Interview.talk_phrases["make_actual"] = config["talk"]["make_actual"]
        Shortcuts.Interview.talk_commands["tell_info"] = config["talk_commands"]["tell_info"]
        Shortcuts.Interview.talk_commands["want_work"] = config["talk_commands"]["want_work"]
        Shortcuts.Interview.talk_commands["want_change"] = config["talk_commands"]["want_change"]
        Shortcuts.Interview.talk_commands["yes"] = config["talk_commands"]["yes"]
        Shortcuts.Interview.talk_commands["no"] = config["talk_commands"]["no"]
        print("Phrases config is done.")
    except KeyError:
        print("Phrases config error: File structure is invalid.")
        exit()


def getConfig() -> None:
    config = configparser.ConfigParser()
    config.read("settings.ini")
    try:
        GlobalStuff.Conn.token = config["S"]["token"]
        GlobalStuff.Conn.server_ip = config["S"]["server_ip"]
        ipaddress.ip_address(GlobalStuff.Conn.server_ip.split(":")[0])
        GlobalStuff.Conn.bot_ip = config["S"]["bot_ip"]
        ipaddress.ip_address(GlobalStuff.Conn.bot_ip.split(":")[0])
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
            state = Shortcuts.User.getState(msg)
            candidate = ConnectionService.Clienting.getCandidateInfo(msg.from_user.id)
            candidate.tg_id = msg.from_user.id
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
        async def send(msg) -> None:
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

        @staticmethod
        def compare_message(msg: str, to: str):
            return msg.lower().replace(" ", "") == to.lower().replace(" ", "")

    class Interview:
        main_info_phrases = [{"R": "", "F": ""},
                             {"R": "", "F": ""},
                             {"R": "", "F": ""},
                             {"R": "", "F": ""},
                             {"R": "", "F": ""},
                             {"R": "", "F": "", "A": ""}]

        mistake_phrases = {"mistake": "", "too_long": "", "no_vacancies": "", "old_info": ""}

        talk_phrases = {"what_info": "", "what_vacancy": "", "the_end": "", "main_info_done": "",
                        "is_your_choice": "", "lets_talk": "", "main_info": "", "not_choice": "",
                        "vacancy_info": "", "is_actual": "", "make_actual": ""}

        talk_commands = {"tell_info": "", "want_work": "", "want_change": "", "yes": "", "no": ""}

        @staticmethod
        async def mainInfoAsk(call, first: bool = False):
            state = Shortcuts.User.getState(call)
            if first:
                await state.update_data(step=0)
            step = int((await state.get_data())["step"])
            candidate = (await state.get_data())["candidate"]

            if step < candidate.get_main_info_length():
                if candidate.main_info(step)[1] != "":
                    if not (candidate.main_info(step)[0] == "external_resumes" and candidate.external_resumes == "<!>"):
                        await Shortcuts.Messages.send_msg(call,
                                                          candidate.main_info(step)[1] +
                                                          Shortcuts.Interview.main_info_phrases[step]["R"],
                                                          Keyboards.yesno_kb)
                    else:
                        await Shortcuts.Messages.send_msg(call,
                                                          Shortcuts.Interview.main_info_phrases[step]["A"],
                                                          Keyboards.yesno_kb)
                else:
                    await Shortcuts.Messages.send_msg(call, Shortcuts.Interview.main_info_phrases[step]["F"])

        @staticmethod
        async def mainInfoAnswer(msg) -> bool:
            state = Shortcuts.User.getState(msg)
            candidate = (await state.get_data())["candidate"]
            step = int((await state.get_data())["step"])
            if candidate.main_info(step)[0] == "external_resumes" and candidate.external_resumes == "<!>":
                if Shortcuts.Messages.compare_message(msg.text, Shortcuts.Interview.talk_commands["yes"]):
                    candidate.main_info_set(step, "")
                    await state.update_data(candidate=candidate)
                    return False
            else:
                if candidate.main_info(step)[1] != "":
                    if Shortcuts.Messages.compare_message(msg.text, Shortcuts.Interview.talk_commands["no"]):
                        candidate.main_info_set(step, "")
                        await state.update_data(candidate=candidate)
                        return False
                else:
                    if step == 1 and not Validation.is_valid_date(msg.text):
                        await Shortcuts.Messages.send_msg(msg, Shortcuts.Interview.mistake_phrases["mistake"])
                        return False
                    if step != 1 and not Validation.is_valid_str(msg.text):
                        await Shortcuts.Messages.send_msg(msg, Shortcuts.Interview.mistake_phrases["too_long"])
                        return False
                    candidate.main_info_set(step, msg.text)
            step += 1
            await state.update_data(step=step)
            await state.update_data(candidate=candidate)
            return step >= candidate.get_main_info_length()

        @staticmethod
        async def reqAsk(call, first: bool = False):
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
                    await Shortcuts.Messages.send_msg(call, Shortcuts.Interview.talk_phrases["is_actual"] + candidate.forms[form], Keyboards.yesno_kb)

        @staticmethod
        async def reqAnswer(msg) -> bool:
            state = Shortcuts.User.getState(msg)
            vti = int((await state.get_data())["vac_to_int"])
            candidate = (await state.get_data())["candidate"]
            step = int((await state.get_data())["step"])
            if len(CachedDB.form_to_vac[vti]) > step:
                form = CachedDB.form_to_vac[vti][step]
                if form in candidate.forms:
                    if Shortcuts.Messages.compare_message(msg.text, Shortcuts.Interview.talk_commands["yes"]):
                        step += 1
                    else:
                        candidate.forms.pop(form)
                        await Shortcuts.Messages.send_msg(msg, Shortcuts.Interview.talk_phrases["make_actual"])
                else:
                    candidate.forms[form] = msg.text
                    step += 1
                await state.update_data(step=step)
                await state.update_data(candidate=candidate)
            return step >= len(CachedDB.form_to_vac[vti])

        @staticmethod
        async def endOfInterview(msg):
            state = Shortcuts.User.getState(msg)
            candidate = (await state.get_data())["candidate"]
            candidate.wantedVacancy = await Shortcuts.User.getVTI(msg)
            await state.update_data(candidate=candidate)
            # await state.update_data(interview=0)


async def shutdown(dispatcher: Dispatcher):
    await dispatcher.storage.close()
    await dispatcher.storage.wait_closed()
