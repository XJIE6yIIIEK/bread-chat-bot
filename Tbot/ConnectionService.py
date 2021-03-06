import GlobalStuff
import Utils
from GlobalStuff import CachedDB, Candidate
import grpc
import KeyboardsService
import telegramBot_pb2 as pb2
import telegramBot_pb2_grpc as pb2_g
from threading import Thread
from concurrent import futures


def freeFormsZero() -> None:
    CachedDB.form_to_vac[0] = []


def freeSomeForms() -> None:
    freeFormsZero()
    for form in CachedDB.all_forms:
        add: bool = True
        for vac in CachedDB.form_to_vac:
            if form in CachedDB.form_to_vac[vac]:
                add = False
        if add:
            CachedDB.form_to_vac[0].append(form)


class Clienting:
    @staticmethod
    def setupClient() -> None:
        GlobalStuff.Conn.channel = grpc.insecure_channel(GlobalStuff.Conn.server_ip)
        GlobalStuff.Conn.stub = pb2_g.BotServiceStub(GlobalStuff.Conn.channel)

    @staticmethod
    def getCache():
        cache = GlobalStuff.Conn.stub.getCache(pb2.Empty())

        for ob in cache.vacancies:
            CachedDB.all_vacs[ob.id] = ob.s_name

        for ob in cache.forms:
            CachedDB.all_forms[ob.id] = ob.s_name
            if ob.b_general:
                CachedDB.general_forms.append(ob.id)

        for ob in cache.formToVacs:
            if ob.n_vacancy in CachedDB.form_to_vac:
                if ob.n_form not in CachedDB.form_to_vac[ob.n_vacancy]:
                    CachedDB.form_to_vac[ob.n_vacancy].append(ob.n_form)
            else:
                CachedDB.form_to_vac[ob.n_vacancy] = [ob.n_form]

        for ob in cache.companyInfos:
            CachedDB.info_ab_us[ob.id] = {"name": ob.s_name, "message": ob.s_message}

        print("Main client setup is done. Getting cache is done.")

    @staticmethod
    def sendCandidateInfo(candidate: Candidate):
        if candidate.external_resumes == "<!>":
            candidate.external_resumes = ""
        # print("Sending candidate:")
        # print(candidate.name, "\n", candidate.birth, "\n", candidate.phone, "\n", candidate.address, "\n", candidate.mail, "\n", candidate.tg_id, "\n", candidate.external_resumes, "\n", candidate.wantedVacancy)
        main_info = pb2.Candidate(s_name=candidate.name,
                                  d_birth_date=candidate.birth,
                                  s_phone_number=candidate.phone,
                                  s_address=candidate.address,
                                  e_mail=candidate.mail,
                                  s_tg_id=candidate.tg_id,
                                  s_external_resumes=candidate.external_resumes)
        resumes = []
        for ob in candidate.forms:
            resumes.append(pb2.CandidateResume(n_form=ob, s_value=candidate.forms[ob]))
        request: pb2.CandidateRequest
        if candidate.wantedVacancy != 0:
            request = pb2.CandidateRequest(candidateMainInfo=main_info, candidateResumes=resumes, wantedVacancy=candidate.wantedVacancy)
        else:
            request = pb2.CandidateRequest(candidateMainInfo=main_info, candidateResumes=resumes)
        GlobalStuff.Conn.stub.sendCandidateInfo(request)

    @staticmethod
    def getCandidateInfo(tg_id) -> Candidate:
        candidate: pb2.CandidateRequest = GlobalStuff.Conn.stub.getCandidateInfo(pb2.TgId(s_tg_id=str(tg_id)))
        out = Candidate()
        out.name = candidate.candidateMainInfo.s_name
        out.birth = candidate.candidateMainInfo.d_birth_date
        out.phone = candidate.candidateMainInfo.s_phone_number
        out.address = candidate.candidateMainInfo.s_address
        out.mail = candidate.candidateMainInfo.e_mail
        out.tg_id = candidate.candidateMainInfo.s_tg_id
        external_resumes = candidate.candidateMainInfo.s_external_resumes
        if external_resumes == "":
            external_resumes = "<!>"
        out.external_resumes = external_resumes
        out.wantedVacancy = candidate.wantedVacancy

        for meeting in candidate.candidateMeetings:
            GlobalStuff.CachedDB.dates_assigned[str(tg_id)][meeting.n_vacancy] = meeting.d_date

        if out.name != "":
            out.first_time = False

        for ob in candidate.candidateResumes:
            out.forms[ob.n_form] = ob.s_value

        return out


class Servering:
    class ServClass(pb2_g.BotServiceServicer):
        def infoUpdated(self, request, context):
            print(request)
            r_id = request.info.id
            r_name = request.info.s_name
            r_msg = request.info.s_message
            if r_name is None or r_name == "" or r_msg is None or r_msg == "":
                if r_id in CachedDB.info_ab_us:
                    CachedDB.info_ab_us.pop(r_id)
            else:
                CachedDB.info_ab_us[r_id] = {"name": request.info.s_name, "message": request.info.s_message}
            KeyboardsService.fillInfoKb()
            return pb2.Empty()

        def formUpdated(self, request, context):
            print("Forms updated")
            print(request)
            r_id = request.form.id
            r_name = request.form.s_name
            if r_name is None or r_name == "":
                if r_id in CachedDB.all_forms:
                    CachedDB.all_forms.pop(r_id)
                if r_id in CachedDB.general_forms:
                    CachedDB.general_forms.remove(r_id)
            else:
                CachedDB.all_forms[r_id] = r_name
                if request.form.b_general:
                    if request.form.id not in CachedDB.general_forms:
                        CachedDB.general_forms.append(request.form.id)
            print(CachedDB.all_forms)
            return pb2.Empty()

        def vacancyUpdated(self, request: pb2.UpdatedVacancy, context):
            print("Vacancy updated")
            print(request)
            r_id = request.vacancy.id
            r_name = request.vacancy.s_name
            if r_name == "":
                if r_id in CachedDB.all_vacs:
                    CachedDB.all_vacs.pop(r_id)
            else:
                CachedDB.all_vacs[r_id] = r_name
            KeyboardsService.fillVacsKb()
            print(CachedDB.all_vacs)
            return pb2.Empty()

        def formToVacUpdated(self, request, context):
            print("FTV updated")
            print(request)
            vac_id = request.vacancyForm.n_vacancy
            form_id = request.vacancyForm.n_form

            if request.delete:
                if vac_id in CachedDB.form_to_vac and form_id in CachedDB.form_to_vac[vac_id]:
                    CachedDB.form_to_vac[vac_id].pop(CachedDB.form_to_vac[vac_id].index(form_id))
                    if len(CachedDB.form_to_vac[vac_id]) == 0:
                        CachedDB.form_to_vac.pop(vac_id)
            else:
                if vac_id in CachedDB.form_to_vac:
                    if form_id not in CachedDB.form_to_vac[vac_id]:
                        CachedDB.form_to_vac[vac_id].append(form_id)
                else:
                    CachedDB.form_to_vac[vac_id] = [form_id]
            print(CachedDB.form_to_vac)
            return pb2.Empty()

    @staticmethod
    def serve():
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        pb2_g.add_BotServiceServicer_to_server(Servering.ServClass(), server)
        server.add_insecure_port(GlobalStuff.Conn.bot_ip)
        server.start()
        server.wait_for_termination()

    @staticmethod
    def setupServer():
        Thread(target=Servering.serve, daemon=True).start()
        print("Main server setup is done.")


class CalendarClienting:
    @staticmethod
    def setupClient() -> None:
        GlobalStuff.Conn.calendar_channel = grpc.insecure_channel(GlobalStuff.Conn.calendar_server_ip)
        GlobalStuff.Conn.calendar_stub = pb2_g.BotCalendarServiceStub(GlobalStuff.Conn.calendar_channel)
        print("Calendar client setup is done.")

    @staticmethod
    def candidateChooseTime(tg_id: str, vacancy: int, date: pb2.Time) -> int:
        data = pb2.TimeResponse(s_tg_id=tg_id, n_vacancy=vacancy, date=date)
        e: str
        try:
            err: pb2.Error = GlobalStuff.Conn.calendar_stub.candidateChooseTime(data)
            e = err.err
        except Exception:
            e = "unauthorized"
        return {"": 0, "unavailable": 1, "unauthorized": 2, 'unwanted': 0}[e]

    @staticmethod
    def rejectMeeting(tg_id: str, vacancy: int) -> bool:
        try:
            GlobalStuff.Conn.calendar_stub.rejectMeeting(pb2.Rejection(s_tg_id=tg_id, n_vacancy=vacancy))
            return True
        except Exception:
            print("Not rejected")
            return False

    @staticmethod
    def rejectAll(tg_id: str) -> bool:
        try:
            err: pb2.Error = GlobalStuff.Conn.calendar_stub.rejectAll(pb2.HardReject(s_tg_id=tg_id))
            return True
        except Exception:
            print("Not rejected")
            return False
