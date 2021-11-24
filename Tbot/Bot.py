from GlobalStuff import CachedDB, Keyboards, BotStuff
import Utils
from Utils import Shortcuts
import ConnectionService
import KeyboardsService
from Utils import BotStates
from aiogram import types
from aiogram.utils import executor
import grpc


Utils.getConfig()
Utils.setupBot()


@BotStuff.dp.message_handler(state='*', commands=['start'])
async def start_com(msg: types.Message):
    await Utils.SetBotCommands()
    await Shortcuts.Messages.send_msg(msg, "Приветствую!", Keyboards.hub_kb)
    await BotStates.Hub.set()
    await Shortcuts.User.initUser(msg)


@BotStuff.dp.message_handler(state=BotStates.Hub)
async def hub_talk(msg: types.Message):
    if msg.text == "Расскажи мне про вашу компанию":
        await Shortcuts.Messages.send_msg(msg, "Что вас интересует?", Keyboards.info_kb)
    elif msg.text == "Хочу работать у вас":
        if len(CachedDB.all_vacs) != 0:
            await Shortcuts.Messages.send_msg(msg, "Какая из доступных вакансий вас интересует?", Keyboards.vacs_kb)
        else:
            await Shortcuts.Messages.send_msg(msg, "К сожалению, на данный момент нет доступных вакансий.")
    elif msg.text == "Хочу изменить основную информацию о себе":
        await Shortcuts.Interview.mainInfoAsk()
        await BotStates.InterviewMain.set()

@BotStuff.dp.callback_query_handler(state=BotStates.Hub)
async def hub_button(call: types.CallbackQuery):
    case = call.data[0:4]
    key = call.data[4:]
    if case == "iau:":
        if key in CachedDB.info_ab_us:
            await Shortcuts.Messages.answer(call, CachedDB.info_ab_us[key])
        else:
            await Shortcuts.Messages.answer(call, "Эта информация больше недоступна.")
    elif case == "vac:":
        await call.answer()
        await Shortcuts.User.setVTI(call, int(key))
        await Shortcuts.Messages.send_msg(call, CachedDB.all_vacs[int(key)] + " - Ваш выбор?", Keyboards.yesno_kb)
        await BotStates.VacancyChoice.set()


@BotStuff.dp.message_handler(state=BotStates.VacancyChoice)
async def vacancy_choice(msg: types.Message):
    if msg.text == "Да":
        await Shortcuts.Messages.send_msg(msg, "Прекрасно! Давайте проведём первичное собеседование!")
        if await Shortcuts.User.isUserNotEmpty(msg):
            await Shortcuts.Interview.reqAsk(msg, True)
            await BotStates.InterviewVac.set()
        else:
            await Shortcuts.Messages.send_msg(msg, "Для начала заполним основную информацию.")
            await BotStates.InterviewMain.set()
            await Shortcuts.Interview.mainInfoAsk(msg)
    else:
        await BotStates.Hub.set()
        await Shortcuts.User.setVTI(msg)
        await Shortcuts.Messages.send_msg(msg, "Вы можете выбрать что-то другое.", Keyboards.hub_kb)


@BotStuff.dp.message_handler(state=BotStates.InterviewMain)
async def main_info_talk(msg: types.Message):
    await Shortcuts.Interview.mainInfoAnswer(msg)
    if not await Shortcuts.User.isUserNotEmpty():
        await Shortcuts.Interview.mainInfoAsk(msg)
    else:
        await Shortcuts.Messages.send_msg(msg, "Основная информация заполнена.")
        if (await Shortcuts.User.getVTI(msg)) == -1:
            await Shortcuts.User.send(msg)
            await BotStates.Hub.set()
        else:
            await Shortcuts.Messages.send_msg(msg, "Теперь перейдём информации, относящейся к вакансии.")
            await Shortcuts.Interview.reqAsk(msg, True)
            await BotStates.InterviewVac.set()


@BotStuff.dp.message_handler(state=BotStates.InterviewVac)
async def req_info_talk(msg: types.Message):
    if await Shortcuts.Interview.reqAnswer(msg):
        await Shortcuts.User.setVTI(msg)
        await Shortcuts.User.send(msg)
        await Shortcuts.Interview.endOfInterview(msg)
        await Shortcuts.Messages.send_msg(msg, "Интервью закончено.", Keyboards.hub_kb)
    else:
        await Shortcuts.Interview.reqAsk(msg)


if __name__ == '__main__':
    try:
        ConnectionService.Clienting.setupClient()
        ConnectionService.Servering.setupServer()
        ConnectionService.Clienting.getCache()

        KeyboardsService.fillInfoKb()
        KeyboardsService.fillVacsKb()
        KeyboardsService.fillReplyKbs()

        executor.start_polling(BotStuff.dp, on_shutdown=Utils.shutdown)
    except grpc.RpcError as rpc_error:
        if rpc_error.code() == grpc.StatusCode.UNAVAILABLE:
            print("Connection failed. *-*")
        else:
            print("Something gone wrong. X_X")
