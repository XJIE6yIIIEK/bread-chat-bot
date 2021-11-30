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
    all_forms: dict = {}
    form_to_vac: dict = {}


class Keyboards:
    info_kb: InlineKeyboardMarkup = InlineKeyboardMarkup()
    vacs_kb: InlineKeyboardMarkup = InlineKeyboardMarkup()
    yesno_kb: ReplyKeyboardMarkup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    hub_kb: ReplyKeyboardMarkup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=False)


class Candidate:
    def __init__(self):
        self.__main_info: dict = {"name": "", "birth": "", "phone": "", "address": "", "mail": "", "external_resumes": "", "tg_id": ""}
        self.forms: dict = {}
        self.wantedVacancy = -1

    def main_info(self, index: int):
        i = 0
        for ob in self.__main_info:
            if i == index:
                return [ob, self.__main_info[ob]]
            i += 1
        return [None, None]

    def main_info_set(self, index: int, val: str):
        i = 0
        for ob in self.__main_info:
            if i == index:
                self.__main_info[ob] = val
            i += 1

    @property
    def name(self):
        return self.__main_info["name"]

    @name.setter
    def name(self, v: str):
        self.__main_info["name"] = v

    @property
    def birth(self):
        return self.__main_info["birth"]

    @birth.setter
    def birth(self, v: str):
        self.__main_info["birth"] = v

    @property
    def phone(self):
        return self.__main_info["phone"]

    @phone.setter
    def phone(self, v: str):
        self.__main_info["phone"] = v

    @property
    def address(self):
        return self.__main_info["address"]

    @address.setter
    def address(self, v: str):
        self.__main_info["address"] = v

    @property
    def mail(self):
        return self.__main_info["mail"]

    @mail.setter
    def mail(self, v: str):
        self.__main_info["mail"] = v

    @property
    def tg_id(self):
        return self.__main_info["tg_id"]

    @tg_id.setter
    def tg_id(self, v: str):
        self.__main_info["tg_id"] = v

    @property
    def external_resumes(self):
        return self.__main_info["external_resumes"]

    @external_resumes.setter
    def external_resumes(self, v: str):
        self.__main_info["external_resumes"] = v

    def get_main_info_length(self) -> int:
        return len(self.__main_info)-1

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
