import grpc
import telegramBot_pb2_grpc as pb2_g
from aiogram.types import ReplyKeyboardMarkup, InlineKeyboardMarkup
from aiogram.dispatcher import Dispatcher
from aiogram import Bot


class BotStuff:
    dp: Dispatcher
    bot: Bot


class Conn:
    token: str = ""
    server_ip: str = ""
    bot_ip: str = ""
    channel: grpc.Channel
    stub: pb2_g.BotServiceStub


class CachedDB:
    info_ab_us: dict = {}
    all_vacs: dict = {}
    all_reqs: dict = {}
    req_to_vac: dict = {}


class Keyboards:
    info_kb: InlineKeyboardMarkup = InlineKeyboardMarkup()
    vacs_kb: InlineKeyboardMarkup = InlineKeyboardMarkup()
    yesno_kb: ReplyKeyboardMarkup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    hub_kb: ReplyKeyboardMarkup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=False)


class Candidate:
    def __init__(self):
        self.name: str = ""
        self.birth: str = ""
        self.phone: str = ""
        self.address: str = ""
        self.mail: str = ""
        self.tg_id: str = ""
        self.reqs: dict = {}

    def mainInfoEmpty(self):
        if self.name == "":
            return "name"
        if self.birth == "":
            return "birth"
        if self.phone == "":
            return "phone"
        if self.address == "":
            return "address"
        if self.mail == "":
            return "mail"
        return None