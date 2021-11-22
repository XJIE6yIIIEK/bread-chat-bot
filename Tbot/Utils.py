import GlobalStuff
import configparser


def getConfig():
    config = configparser.ConfigParser()
    config.read("settings.ini")
    try:
        GlobalStuff.Conn.token = config["S"]["token"]
        GlobalStuff.Conn.server_ip = config["S"]["server_ip"]
        GlobalStuff.Conn.bot_ip = config["S"]["bot_ip"]
    except KeyError:
        print("Config error.")
        exit()


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
