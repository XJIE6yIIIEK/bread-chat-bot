import GlobalStuff
from GlobalStuff import CachedDB, Keyboards, BotStuff
import Utils
from Utils import Shortcuts
import ConnectionService
import KeyboardsService
import grpc

from aiogram import Bot, types
from aiogram.dispatcher import Dispatcher
from aiogram.utils import executor


Utils.getConfig()
Utils.setupBot()


@BotStuff.dp.callback_query_handler(state='*')
async def button_pressed(call: types.CallbackQuery):
    case = call.data[0:4]
    key = call.data[4:]
    state = BotStuff.dp.current_state(user=call.from_user.id)
    if case == "iau:":
        if key in CachedDB.info_ab_us:
            await Shortcuts.Messages.answer(call, CachedDB.info_ab_us[key])
        else:
            await Shortcuts.Messages.answer(call, "Эта информация больше недоступна.")
    elif case == "vac:":
        await call.answer()
        await state.update_data(vac_to_int=key)
        await Shortcuts.Messages.send_msg(call, "Ваш выбор - " + CachedDB.all_vacs[int(key)], Keyboards.yesno_kb)
    elif case == "yon:":
        if key == "YES":
            cand_info = ConnectionService.Clienting.getCandidateInfo(call.from_user.id)
            cand_info.tg_id = call.from_user.id
            await state.update_data(candidate=cand_info)

            if cand_info.mainInfoEmpty() is None:
                await state.update_data(interview=1)
                await state.update_data(step=0)
                await call.answer()
                await Shortcuts.Messages.send_msg(call, "Прекрасно! Информация по вакансии.", -1)
                await Shortcuts.Interview.reqAsk(call)
            else:
                await state.update_data(interview=-1)
                await state.update_data(step=0)
                await call.answer()
                await Shortcuts.Messages.send_msg(call, "Прекрасно! Для начала, основная информация.", -1)
                await Shortcuts.Interview.mainInfoAsk(call)
        else:
            pass


@BotStuff.dp.message_handler(state='*', commands=['start'])
async def proc_start_com(msg: types.Message):
    await Shortcuts.initUser(msg)
    await Shortcuts.Messages.send_msg(msg, "Приветствую!", Keyboards.hub_kb)


@BotStuff.dp.message_handler(state='*')
async def proc_talk(msg: types.Message):
    await Shortcuts.initUser(msg)
    if await Shortcuts.Interview.isInInterview(msg):
        state = BotStuff.dp.current_state(user=msg.from_user.id)
        if (await state.get_data())["interview"] == -1:
            await Shortcuts.Interview.mainInfoAnswer(msg)
            if (await state.get_data())["candidate"].mainInfoEmpty() is not None:
                await Shortcuts.Interview.mainInfoAsk(msg)
            else:
                if (await state.get_data())["interview"] == 1:
                    await Shortcuts.Interview.reqAsk(msg)
        else:
            await Shortcuts.Interview.reqAnswer(msg)
    else:
        if msg.text == "Расскажи мне про вашу компанию":
            await Shortcuts.Messages.send_msg(msg, "Что именно вы хотите узнать?", Keyboards.info_kb)
        elif msg.text == "Хочу работать у вас":
            await Shortcuts.Messages.send_msg(msg, "Предлагаемые вакансии:", Keyboards.vacs_kb)


async def shutdown(dispatcher: Dispatcher):
    await dispatcher.storage.close()
    await dispatcher.storage.wait_closed()


def print_debug_info():
    print(CachedDB.info_ab_us)
    print(CachedDB.all_vacs)
    print(CachedDB.all_reqs)
    print(CachedDB.req_to_vac)


if __name__ == '__main__':
    try:
        ConnectionService.Clienting.setupClient()
        ConnectionService.Servering.setupServer()

        ConnectionService.Clienting.getCache()
        KeyboardsService.fillInfoKb()
        KeyboardsService.fillVacsKb()
        KeyboardsService.fillYesnoKb()
        KeyboardsService.fillReplyKbs()

        print_debug_info()

        executor.start_polling(BotStuff.dp, on_shutdown=shutdown)
    except grpc.RpcError as rpc_error:
        if rpc_error.code() == grpc.StatusCode.UNAVAILABLE:
            print("Connection failed. *-*")
        else:
            print("Something gone wrong. X_X")
