import GlobalStuff
from GlobalStuff import CachedDB, Candidate
import grpc
import KeyboardsService
import telegramBot_pb2 as pb2
import telegramBot_pb2_grpc as pb2_g
from threading import Thread
from concurrent import futures


class Clienting:
    @staticmethod
    def setupClient():
        GlobalStuff.Conn.channel = grpc.insecure_channel(GlobalStuff.Conn.server_ip)
        GlobalStuff.Conn.stub = pb2_g.BotServiceStub(GlobalStuff.Conn.channel)

    @staticmethod
    def getCache():
        cache = GlobalStuff.Conn.stub.getCache(pb2.Empty())

        for ob in cache.vacancies:
            CachedDB.all_vacs[ob.id] = ob.s_name

        for ob in cache.forms:
            CachedDB.all_forms[ob.id] = ob.s_name

        for ob in cache.formToVacs:
            if ob.n_vacancy in CachedDB.form_to_vac:
                if ob.n_form not in CachedDB.form_to_vac[ob.n_vacancy]:
                    CachedDB.form_to_vac[ob.n_vacancy].append(ob.n_form)
            else:
                CachedDB.form_to_vac[ob.n_vacancy] = [ob.n_form]

        for ob in cache.companyInfos:
            CachedDB.info_ab_us[ob.s_name] = ob.s_message

    @staticmethod
    def sendCandidateInfo(candidate: Candidate):
        if candidate.external_resumes == "<!>":
            candidate.external_resumes = ""
        print("Sending candidate:")
        print(candidate.name)
        print(candidate.birth)
        print(candidate.phone)
        print(candidate.address)
        print(candidate.mail)
        print(candidate.tg_id)
        print(candidate.external_resumes)
        print(candidate.wantedVacancy)
        main_info = pb2.Candidate(s_name=candidate.name,
                                  d_birth_date=candidate.birth,
                                  s_phone_number=candidate.phone,
                                  s_address=candidate.address,
                                  e_mail=candidate.mail,
                                  s_tg_id=str(candidate.tg_id),
                                  s_external_resumes=candidate.external_resumes)
        resumes = []
        for ob in candidate.forms:
            resumes.append(pb2.CandidateResume(n_requirement=ob, s_value=candidate.forms[ob]))
        GlobalStuff.Conn.stub.sendCandidateInfo(pb2.CandidateRequest(candidateMainInfo=main_info, candidateResumes=resumes, wantedVacancy=candidate.wantedVacancy))

    @staticmethod
    def getCandidateInfo(tg_id) -> Candidate:
        candidate = GlobalStuff.Conn.stub.getCandidateInfo(pb2.TgId(s_tg_id=str(tg_id)))
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

        for ob in candidate.candidateResumes:
            out.forms[ob.n_requirement] = ob.s_value

        return out


class Servering:
    class ServClass(pb2_g.BotServiceServicer):
        def infoUpdated(self, request, context):
            if request.info.s_name in CachedDB.info_ab_us and CachedDB.info_ab_us[request.info.s_name] == request.info.s_message:
                CachedDB.info_ab_us.pop(request.info.s_name)
            else:
                CachedDB.info_ab_us[request.info.s_name] = request.info.s_message
            KeyboardsService.fillInfoKb()
            return pb2.Empty()

        def formUpdated(self, request, context):
            if request.form.id in CachedDB.all_forms and \
                    CachedDB.all_forms[request.form.id] == request.form.s_name:
                CachedDB.all_forms.pop(request.form.id)
            else:
                CachedDB.all_forms[request.form.id] = request.form.s_name
            return pb2.Empty()

        def vacancyUpdated(self, request, context):
            if request.vacancy.id in CachedDB.all_vacs and CachedDB.all_vacs[request.vacancy.id] == request.vacancy.s_name:
                CachedDB.all_vacs.pop(request.vacancy.id)
            else:
                CachedDB.all_vacs[request.vacancy.id] = request.vacancy.s_name
            KeyboardsService.fillVacsKb()
            return pb2.Empty()

        def formToVacUpdated(self, request, context):
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
                        CachedDB.form_to_vac[vac_id].append(vac_id)
                else:
                    CachedDB.form_to_vac[vac_id] = [form_id]
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
