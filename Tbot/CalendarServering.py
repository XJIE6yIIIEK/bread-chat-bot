import GlobalStuff
from Utils import Shortcuts, BotStates
from grpc import aio
import telegramBot_pb2 as pb2
import telegramBot_pb2_grpc as pb2_g
from threading import Thread
from concurrent import futures


class ServClass(pb2_g.BotCalendarServiceServicer):
    def interviewScheduled(self, request: pb2.InterviewScheduledRequest, context):
        return pb2.Empty()

    def systemHasTime(self, request: pb2.TimeRequest, context):
        tg_id = request.s_tg_id
        state = Shortcuts.User.getStateByTGID(tg_id)
        #await state.update_data(dates=request.dates)
        #await BotStates.ChooseDate.set()
        #await Shortcuts.Messages.send_msg_to_user(tg_id, GlobalStuff.Phrases.talk_phrases["candidate_approved"], GlobalStuff.Keyboards.ok_kb)
        return pb2.Empty()


def serve():
    server = aio.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_g.add_BotServiceServicer_to_server(ServClass(), server)
    server.add_insecure_port(GlobalStuff.Conn.calendar_bot_ip)
    await server.start()
    await server.wait_for_termination()


def setupServer() -> None:
    Thread(target=serve, daemon=True).start()
    print("Calendar server setup is done.")
