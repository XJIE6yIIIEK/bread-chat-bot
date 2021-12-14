import GlobalStuff
from GlobalStuff import CachedDB, Keyboards, BotStuff, Phrases
import Utils
from Utils import Shortcuts
import ConnectionService
import CalendarServering
import KeyboardsService
from Utils import BotStates
from aiogram import types
from aiogram.utils import executor
import grpc


Utils.getPhrases()
Utils.getConfig()
Utils.setupBot()


@BotStuff.dp.message_handler(state='*', commands=['start'])
async def start_com(msg: types.Message):
    await Utils.SetBotCommands()
    await Shortcuts.Messages.send_msg(msg,
                                      Phrases.talk_phrases["on_start"],
                                      Keyboards.hub_kb)
    await BotStates.Hub.set()
    await Shortcuts.User.initUser(msg)


@BotStuff.dp.message_handler(state='*', commands=['help'])
async def help_com(msg: types.Message):
    await Shortcuts.Messages.send_msg(msg, "Если бот не отвечает на ваши запросы, перезапустите его с помощью команды /start\n"
                                           "Отсутствие отклика после будет означать, что бот временно выведен из строя.\n"
                                           "Для изменения основной информации о себе используйте команду /change или "
                                           "соответствующую кнопку навигации.")


@BotStuff.dp.message_handler(state='*', commands=['change'])
async def change_com(msg: types.Message):
    await start_main_interview(msg)


@BotStuff.dp.message_handler(state='*', commands=['set_meeting'])
async def set_meeting(msg: types.Message):
    dates = GlobalStuff.CachedDB.dates[str(msg.from_user.id)]
    kb = KeyboardsService.createMeetingVacanciesKb(dates)
    await Shortcuts.Messages.send_msg(msg, "Выберите вакансию, дату собеседования на которую хотите установить:", kb)
    if kb is None:
        await Shortcuts.Messages.send_msg(msg, "К сожалению, сейчас нет одобренных вакансий для Вас.")


async def showDatesPage(call, vac: int, page_start: int = 0):
    await call.answer()
    tg_id = str(call.from_user.id)
    vac_dates = GlobalStuff.CachedDB.dates[tg_id][vac]
    kb = KeyboardsService.createDatesKb(vac_dates, vac, page_start)
    await call.message.edit_text("Выберите день собеседования:", reply_markup=kb)


async def showTimesPage(call, vac: int, date: int):
    await call.answer()
    tg_id = str(call.from_user.id)
    date_times = GlobalStuff.CachedDB.dates[tg_id][vac][date].times
    kb = KeyboardsService.createTimesKb(date_times, vac, date)
    await call.message.edit_text("Выберите время: ", reply_markup=kb)


@BotStuff.dp.callback_query_handler(lambda callback_query: callback_query.data.split("/")[0] == "meeting", state='*')
async def choose_interview_date(call: types.CallbackQuery):
    guide = call.data.split("/")

    if guide[1] == "vac":
        await showDatesPage(call, int(guide[2]))
    elif guide[1] == "prev":
        await showDatesPage(call, int(guide[2]), int(guide[3]))
    elif guide[1] == "next":
        await showDatesPage(call, int(guide[2]), int(guide[3]))
    elif guide[1] == "date":
        await showTimesPage(call, int(guide[2]), int(guide[3]))
    elif guide[1] == "back":
        await showDatesPage(call, int(guide[2]))
    elif guide[1] == "confirm":
        tg_id = str(call.from_user.id)
        vac = int(guide[2])
        date = GlobalStuff.CachedDB.dates[tg_id][vac][int(guide[3])].date
        time = GlobalStuff.CachedDB.dates[tg_id][vac][guide[3]].times[int(guide[4])]
        kb = KeyboardsService.createTimeConfirmKb(call.data, int(guide[2], int(guide[3])))
        await call.message.edit_text("Ваш выбор: "+date+" : "+time.beginEnd+"Вы уверены?", reply_markup=kb)
    elif guide[1] == "set":
        tg_id = str(call.from_user.id)
        vac = int(guide[2])
        date = int(guide[3])
        time = GlobalStuff.CachedDB.dates[tg_id][vac][date].times[int(guide[4])]
        await call.answer()
        await call.message.edit_text("Собеседование назначено!", reply_markup=None)
        ConnectionService.CalendarClienting.candidateChooseTime(tg_id, vac, time)


@BotStuff.dp.message_handler(state='*', commands=['get_meetings'])
async def get_meetings(msg: types.Message):
    pass


@BotStuff.dp.message_handler(state=BotStates.Hub)
async def hub_talk(msg: types.Message):
    if Shortcuts.Messages.compare_message(msg.text, Phrases.talk_commands["tell_info"]):
        await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["what_info"], Keyboards.info_kb)
    elif Shortcuts.Messages.compare_message(msg.text, Phrases.talk_commands["want_work"]):
        if len(CachedDB.all_vacs) != 0:
            await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["what_vacancy"], Keyboards.vacs_kb)
        else:
            await Shortcuts.Messages.send_msg(msg, Phrases.mistake_phrases["no_vacancies"])
    elif Shortcuts.Messages.compare_message(msg.text, Phrases.talk_commands["want_change"]):
        await start_main_interview(msg)


@BotStuff.dp.callback_query_handler(state=BotStates.Hub)
async def hub_button(call: types.CallbackQuery):
    case = call.data[0:4]
    key = call.data[4:]
    if case == "iau:":
        if key in CachedDB.info_ab_us:
            await Shortcuts.Messages.answer(call, CachedDB.info_ab_us[key]["message"])
        else:
            await Shortcuts.Messages.answer(call, Phrases.mistake_phrases["old_info"])
    elif case == "vac:":
        await call.answer()
        await Shortcuts.User.setVTI(call, int(key))
        await Shortcuts.Messages.send_msg(call, CachedDB.all_vacs[int(key)] + Phrases.talk_phrases["is_your_choice"], Keyboards.yesno_kb)
        await BotStates.VacancyChoice.set()


async def start_main_info_talk(msg):
    await Shortcuts.Interview.MainInfoTalk.mainInfoAsk(msg, True)
    await BotStates.InterviewMain.set()


async def start_main_interview(msg):
    if not await Shortcuts.User.firstTime(msg):
        await start_main_info_talk(msg)
    else:
        await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["privacy_check"], Keyboards.yesno_kb)
        await BotStates.CheckPrivacy.set()


@BotStuff.dp.message_handler(state=BotStates.CheckPrivacy)
async def check_privacy_process(msg: types.Message):
    if Shortcuts.Messages.compare_message(msg.text, Phrases.talk_commands["yes"]):
        await start_main_info_talk(msg)
    else:
        await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["privacy_cancel"], Keyboards.hub_kb)
        await BotStates.Hub.set()


@BotStuff.dp.message_handler(state=BotStates.VacancyChoice)
async def vacancy_choice(msg: types.Message):
    if Shortcuts.Messages.compare_message(msg.text, Phrases.talk_commands["yes"]):
        await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["lets_talk"])
        if await Shortcuts.User.isUserNotEmpty(msg):
            await Shortcuts.Interview.ReqTalk.reqAsk(msg, True)
            await BotStates.InterviewVac.set()
        else:
            await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["main_info"])
            await start_main_interview(msg)
    else:
        await BotStates.Hub.set()
        await Shortcuts.User.setVTI(msg)
        await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["not_choice"], Keyboards.hub_kb)


async def main_info_done(msg):
    if (await Shortcuts.User.getVTI(msg)) == -1:
        await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["main_info_done"], Keyboards.hub_kb)
        await Shortcuts.User.send(msg)
        await BotStates.Hub.set()
    else:
        await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["main_info_done"])
        await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["vacancy_info"])
        await Shortcuts.Interview.ReqTalk.reqAsk(msg, True)
        await BotStates.InterviewVac.set()


@BotStuff.dp.message_handler(state=BotStates.InterviewMain)
async def main_info_talk(msg: types.Message):
    if await Shortcuts.Interview.MainInfoTalk.mainInfoAnswer(msg):
        if await Shortcuts.Interview.FreeFormTalk.freeFormAsk(msg, True):
            await BotStates.InterviewFormAsk.set()
        else:
            await main_info_done(msg)
    else:
        await Shortcuts.Interview.MainInfoTalk.mainInfoAsk(msg)


@BotStuff.dp.message_handler(state=BotStates.InterviewFormAsk)
async def form_info_ask(msg: types.Message):
    if await Shortcuts.Interview.FreeFormTalk.freeFormYN(msg):
        await BotStates.InterviewFormAnswer.set()
    else:
        if not await Shortcuts.Interview.FreeFormTalk.freeFormAsk(msg):
            await main_info_done(msg)


@BotStuff.dp.message_handler(state=BotStates.InterviewFormAnswer)
async def form_info_answer(msg: types.Message):
    if await Shortcuts.Interview.FreeFormTalk.freeFormAnswer(msg):
        await main_info_done(msg)
    else:
        await Shortcuts.Interview.FreeFormTalk.freeFormAsk(msg)
        await BotStates.InterviewFormAsk.set()


@BotStuff.dp.message_handler(state=BotStates.InterviewVac)
async def req_info_talk(msg: types.Message):
    if await Shortcuts.Interview.ReqTalk.reqAnswer(msg):
        await Shortcuts.Interview.endOfInterview(msg)
        await Shortcuts.User.send(msg)
        await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["the_end"], Keyboards.hub_kb)
        await BotStates.Hub.set()
    else:
        await Shortcuts.Interview.ReqTalk.reqAsk(msg)


@BotStuff.dp.callback_query_handler(state="*")
async def start_date_choose(call: types.CallbackQuery):
    if call.data == Phrases.talk_commands["start_date_choose"]:
        pass


if __name__ == '__main__':
    try:
        ConnectionService.Clienting.setupClient()
        ConnectionService.Clienting.getCache()

        ConnectionService.Servering.setupServer()

        CalendarServering.setupServer()
        ConnectionService.CalendarClienting.setupClient()

        KeyboardsService.fillInfoKb()
        KeyboardsService.fillVacsKb()
        KeyboardsService.fillReplyKbs()

        executor.start_polling(BotStuff.dp, on_shutdown=Utils.shutdown)
        print("Bot is turned off now.")
    except grpc.RpcError as rpc_error:
        if rpc_error.code() == grpc.StatusCode.UNAVAILABLE:
            print("Connection failed. *-*")
        else:
            print("Something gone wrong. X_X")
    input()
