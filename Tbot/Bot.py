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
    await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["help"])


@BotStuff.dp.message_handler(state='*', commands=['change'])
async def change_com(msg: types.Message):
    if not (await Shortcuts.User.isUserInitialized(msg)):
        return

    await start_main_interview(msg)


@BotStuff.dp.message_handler(state='*', commands=['set_meeting'])
async def set_meeting(msg: types.Message):
    if not (await Shortcuts.User.isUserInitialized(msg)):
        return

    dates = GlobalStuff.CachedDB.dates[str(msg.from_user.id)]
    kb = KeyboardsService.createMeetingVacanciesKb(dates)
    await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["take_vacancy_for_set"], kb)
    if kb is None:
        await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["there_is_no_vacs"])


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
    if not (await Shortcuts.User.isUserInitialized(call)):
        return

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
        time = GlobalStuff.CachedDB.dates[tg_id][vac][int(guide[3])].times[int(guide[4])]
        kb = KeyboardsService.createTimeConfirmKb(call.data, int(guide[2]), int(guide[3]))
        await call.message.edit_text("Ваш выбор: "+date+" : "+time.beginEnd+" "+Phrases.talk_phrases["r_u_sure"], reply_markup=kb)
    elif guide[1] == "set":
        tg_id = str(call.from_user.id)
        vac = int(guide[2])
        date = int(guide[3])
        time = GlobalStuff.CachedDB.dates[tg_id][vac][date].times[int(guide[4])]

        await call.answer()

        success: int = ConnectionService.CalendarClienting.candidateChooseTime(tg_id, vac, time)
        if success == 0:
            GlobalStuff.CachedDB.dates[tg_id].pop(vac)
            await call.message.edit_text(Phrases.talk_phrases["meeting_chosen"], reply_markup=None)
            Shortcuts.User.setMeeting(call, vac, time.beginEnd)
        elif success == 1:
            await call.message.edit_text(Phrases.talk_phrases["time_is_occupied"], reply_markup=None)
            GlobalStuff.CachedDB.dates[tg_id][vac][date].times.pop(int(guide[4]))
        elif success == 2:
            await call.message.edit_text(Phrases.talk_phrases["service_is_down"], reply_markup=None)
    elif guide[1] == "reject":
        if guide[2] == "confirm":
            kb = KeyboardsService.createConfirmPreRejectKb(call.data, int(guide[3]))
            await call.message.edit_text(Phrases.talk_phrases["r_u_sure"], reply_markup=kb)
        elif guide[2] == "set":
            tg_id = str(call.from_user.id)
            vac = int(guide[3])
            if ConnectionService.CalendarClienting.rejectMeeting(tg_id, vac):
                GlobalStuff.CachedDB.dates[tg_id].pop(vac)
            await call.message.edit_text("Собеседование отменено", reply_markup=None)
    elif guide[1] == "no_time":
        if guide[2] == "confirm":
            kb = KeyboardsService.createConfirmPreRejectKb(call.data, int(guide[3]))
            await call.message.edit_text(Phrases.talk_phrases["r_u_sure"], reply_markup=kb)
        elif guide[2] == "set":
            tg_id = str(call.from_user.id)
            vac = int(guide[3])
            success: int = ConnectionService.CalendarClienting.candidateChooseTime(tg_id, vac, None)
            if success == 0:
                await call.message.edit_text("HR-менеджер будет уведомлён", reply_markup=None)


@BotStuff.dp.message_handler(state='*', commands=['get_meetings'])
async def get_meetings(msg: types.Message):
    if not (await Shortcuts.User.isUserInitialized(msg)):
        return

    meetings = Shortcuts.User.getMeetings(msg)
    dates_text = ""
    for vac in meetings:
        dates_text += meetings[vac]+"\n"
    await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["scheduled_meetings"]+"\n"+dates_text+Phrases.talk_phrases["how_to_reject"])


async def ShowMeetingRej(msg):
    meetings = Shortcuts.User.getMeetings(msg)
    kb = KeyboardsService.createRejectionKb(meetings)
    await Shortcuts.Messages.send_msg(msg, Phrases.talk_phrases["scheduled_meetings"], kb)


@BotStuff.dp.message_handler(state='*', commands=['reject'])
async def reject_meetings(msg: types.Message):
    if not (await Shortcuts.User.isUserInitialized(msg)):
        return

    await ShowMeetingRej(msg)


@BotStuff.dp.callback_query_handler(lambda callback_query: callback_query.data.split("/")[0] == "reject", state='*')
async def reject_confirm(call: types.CallbackQuery):
    if not (await Shortcuts.User.isUserInitialized(call)):
        return

    guide = call.data.split("/")
    if guide[1] == "ask":
        kb = KeyboardsService.createRejectConfirmKb(call.data)
        await call.message.edit_text(Phrases.talk_phrases["r_u_sure"], reply_markup=kb)
    elif guide[1] == "cancel":
        meetings = Shortcuts.User.getMeetings(call)
        kb = KeyboardsService.createRejectionKb(meetings)
        await call.message.edit_text(Phrases.talk_phrases["scheduled_meetings"], reply_markup=kb)
        await call.answer()
    elif guide[1] == "confirm":
        tg_id = str(call.from_user.id)
        if guide[2] == "all":
            if ConnectionService.CalendarClienting.rejectAll(tg_id):
                Shortcuts.User.deleteAllMeetings(call)
        else:
            vac = int(guide[2])
            if ConnectionService.CalendarClienting.rejectMeeting(tg_id, vac):
                Shortcuts.User.deleteMeeting(call, vac)
            await call.message.edit_text("Собеседование отменено", reply_markup=None)
        await call.answer()


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
        if int(key) in CachedDB.all_vacs:
            # if len(CachedDB.form_to_vac[int(key)]) != 0:
            await call.answer()
            await Shortcuts.User.setVTI(call, int(key))
            await Shortcuts.Messages.send_msg(call, CachedDB.all_vacs[int(key)] + Phrases.talk_phrases["is_your_choice"], Keyboards.yesno_kb)
            await BotStates.VacancyChoice.set()
            # else:
            #    await Shortcuts.Messages.answer(call, Phrases.mistake_phrases["old_info"])
        else:
            await Shortcuts.Messages.answer(call, Phrases.mistake_phrases["old_info"])


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
