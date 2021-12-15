import GlobalStuff
from Utils import Shortcuts
import grpc
import telegramBot_pb2 as pb2
import telegramBot_pb2_grpc as pb2_g
from threading import Thread
from concurrent import futures


class ServClass(pb2_g.BotCalendarServiceServicer):
    def systemHasTime(self, request: pb2.TimeRequest, context):
        tg_id = request.s_tg_id
        GlobalStuff.CachedDB.dates[tg_id][request.n_vacancy] = request.dates
        Shortcuts.Messages.sendMessageByRequest(tg_id, "Ваша заявка была одобрена! Пожалуйста, используйте команду /set\_meeting для выбора даты собеседования.")
        return pb2.Empty()

    def interviewScheduled(self, request: pb2.InterviewScheduledRequest, context):
        print(request)
        tg_id = request.s_tg_id
        Shortcuts.Messages.sendMessageByRequest(tg_id, "Интервью на вакансию _vac_ назначено на дату _date_. Ваш интервьер - _user_.")
        Shortcuts.Messages.sendMessageByRequest(tg_id, "Используйте команду /get_meetings для просмотра всех назначенных собеседований.")
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
