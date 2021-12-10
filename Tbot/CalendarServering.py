import GlobalStuff
from Utils import Shortcuts
import grpc
import KeyboardsService
import telegramBot_pb2 as pb2
import telegramBot_pb2_grpc as pb2_g
from threading import Thread
from concurrent import futures


class ServClass(pb2_g.BotCalendarServiceServicer):
    def interviewScheduled(self, request: pb2.InterviewScheduledRequest, context):
        return pb2.Empty()

    def systemHasTime(self, request: pb2.TimeRequest, context):
        tg_id = request.s_tg_id
        #await Shortcuts.Messages.send_msg_to_user(tg_id, "Возможность назначить собеседование:")
        for date in request.dates:
            kb = KeyboardsService.createDatesKb(date.times)
            #Shortcuts.Messages.send_msg_to_user(tg_id, date.date)
        return pb2.Empty()


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_g.add_BotServiceServicer_to_server(ServClass(), server)
    server.add_insecure_port(GlobalStuff.Conn.calendar_bot_ip)
    server.start()
    server.wait_for_termination()


def setupServer():
    Thread(target=serve, daemon=True).start()
    print("Calendar server setup is done.")
