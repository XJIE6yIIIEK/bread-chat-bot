import GlobalStuff
from Utils import Shortcuts
import grpc
import telegramBot_pb2 as pb2
import telegramBot_pb2_grpc as pb2_g
from concurrent import futures
from threading import Thread


class ServClass(pb2_g.BotCalendarServiceServicer):
    def systemHasTime(self, request: pb2.TimeRequest, context):
        tg_id = request.s_tg_id
        if tg_id not in GlobalStuff.CachedDB.dates:
            GlobalStuff.CachedDB.dates[tg_id] = {}
        GlobalStuff.CachedDB.dates[tg_id][request.n_vacancy] = request.dates
        Shortcuts.Messages.sendMessageByRequest(tg_id, "Ваша заявка была одобрена! Пожалуйста, используйте команду  /set\_meeting для выбора даты собеседования.")
        return pb2.Empty()

    def rejectedByUser(self, request: pb2.Rejection, context):
        print("rejected by user")
        tg_id: str = request.s_tg_id
        vacancy_id: int = request.n_vacancy
        if tg_id in GlobalStuff.CachedDB.dates:
            if vacancy_id in GlobalStuff.CachedDB.dates[tg_id]:
                GlobalStuff.CachedDB.dates[tg_id].pop(vacancy_id)
        if tg_id in GlobalStuff.CachedDB.dates_assigned:
            if vacancy_id in GlobalStuff.CachedDB.dates_assigned[tg_id]:
                GlobalStuff.CachedDB.dates_assigned[tg_id].pop(vacancy_id)

    def connectionCheck(self, request: pb2.Empty, context):
        return pb2.Empty()


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_g.add_BotCalendarServiceServicer_to_server(ServClass(), server)
    server.add_insecure_port(GlobalStuff.Conn.calendar_bot_ip)
    server.start()
    server.wait_for_termination()


def setupServer() -> None:
    Thread(target=serve, daemon=True).start()
    print("Calendar server setup is done.")
