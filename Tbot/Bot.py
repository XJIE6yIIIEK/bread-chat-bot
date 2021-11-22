import GlobalStuff
from GlobalStuff import CachedDB, Keyboards
import Utils
import ConnectionService
import KeyboardsService
import grpc

from aiogram import Bot, types
from aiogram.dispatcher import Dispatcher
from aiogram.utils import executor
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.contrib.middlewares.logging import LoggingMiddleware


import telegramBot_pb2 as pb2
import telegramBot_pb2_grpc as pb2_g


Utils.getConfig()


bot = Bot(token=GlobalStuff.Conn.token)
dp = Dispatcher(bot, storage=MemoryStorage())
dp.middleware.setup(LoggingMiddleware())


class Shortcuts:
    @staticmethod
    async def initUser(call):
        state = dp.current_state(user=call.from_user.id)
        if "candidate" not in (await state.get_data()):
            cand = ConnectionService.Clienting.getCandidateInfo(call.from_user.id)
            await state.update_data(candidate=cand)

    class Messages:
        @staticmethod
        async def send_msg(u_msg, msg: str, kb=None):  # types.reply_keyboard
            if kb is not None:
                if kb != -1:
                    await bot.send_message(u_msg.from_user.id, msg, reply_markup=kb)
                else:
                    await bot.send_message(u_msg.from_user.id, msg, reply_markup=types.ReplyKeyboardRemove())
            else:
                await bot.send_message(u_msg.from_user.id, msg)

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
            state = dp.current_state(user=msg.from_user.id)
            data = await state.get_data()
            if "interview" in data:
                return data["interview"] != 0
            else:
                return False

        @staticmethod
        async def get_vac_to_int(msg):
            state = dp.current_state(user=msg.from_user.id)
            data = await state.get_data()
            if "vac_to_int" in data:
                return data["vac_to_int"]
            else:
                return -1

        @staticmethod
        async def mainInfoAsk(call):
            state = dp.current_state(user=call.from_user.id)
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
                if (await Shortcuts.Interview.get_vac_to_int(msg)) == -1:
                    await state.update_data(interview=0)
                else:
                    await state.update_data(interview=1)
            await state.update_data(candidate=cand)

        @staticmethod
        async def reqAsk(call):
            state = dp.current_state(user=call.from_user.id)
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
            state = dp.current_state(user=msg.from_user.id)
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


# _______________________________________________________
# ==========================HANDLERS=====================
# ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾


@dp.callback_query_handler(state='*')
async def button_pressed(call: types.CallbackQuery):
    case = call.data[0:4]
    key = call.data[4:]
    state = dp.current_state(user=call.from_user.id)
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


@dp.message_handler(state='*', commands=['start'])
async def proc_start_com(msg: types.Message):
    await Shortcuts.initUser(msg)
    await Shortcuts.Messages.send_msg(msg, "Приветствую!", Keyboards.hub_kb)


@dp.message_handler(state='*')
async def proc_talk(msg: types.Message):
    await Shortcuts.initUser(msg)
    if await Shortcuts.Interview.isInInterview(msg):
        state = dp.current_state(user=msg.from_user.id)
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

        executor.start_polling(dp, on_shutdown=shutdown)
    except grpc.RpcError as rpc_error:
        if rpc_error.code() == grpc.StatusCode.UNAVAILABLE:
            print("Connection failed. *-*")
        else:
            print("Something gone wrong. X_X")
