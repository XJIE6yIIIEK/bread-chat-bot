import GlobalStuff
from GlobalStuff import CachedDB
import grpc
import Utils
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

        for ob in cache.requirements:
            CachedDB.all_reqs[ob.id] = ob.s_name

        for ob in cache.reqToVacs:
            if ob.n_vacancy in CachedDB.req_to_vac:
                if ob.n_requirement not in CachedDB.req_to_vac[ob.n_vacancy]:
                    CachedDB.req_to_vac[ob.n_vacancy].append(ob.n_requirement)
            else:
                CachedDB.req_to_vac[ob.n_vacancy] = [ob.n_requirement]

        for ob in cache.companyInfos:
            CachedDB.info_ab_us[ob.s_name] = ob.s_message

    @staticmethod
    def sendCandidateInfo(candidate: Utils.Candidate):
        main_info = pb2.Candidate(s_name=candidate.name,
                                  d_birth_date=candidate.birth,
                                  s_phone_number=candidate.phone,
                                  s_address=candidate.address,
                                  e_mail=candidate.mail,
                                  s_tg_id=str(candidate.tg_id))
        resumes = []
        for ob in candidate.reqs:
            resumes.append(pb2.CandidateResume(n_requirement=ob, s_value=candidate.reqs[ob]))
        GlobalStuff.Conn.stub.sendCandidateInfo(pb2.CandidateRequest(candidateMainInfo=main_info, candidateResumes=resumes))

    @staticmethod
    def getCandidateInfo(tg_id) -> Utils.Candidate:
        candidate = GlobalStuff.Conn.stub.getCandidateInfo(pb2.TgId(s_tg_id=str(tg_id)))
        out = Utils.Candidate()

        out.name = candidate.candidateMainInfo.s_name
        out.birth = candidate.candidateMainInfo.d_birth_date
        out.phone = candidate.candidateMainInfo.s_phone_number
        out.address = candidate.candidateMainInfo.s_address
        out.mail = candidate.candidateMainInfo.e_mail
        out.tg_id = candidate.candidateMainInfo.s_tg_id

        for ob in candidate.candidateResumes:
            out.reqs[ob.n_requirement] = ob.s_value

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

        def requirementUpdated(self, request, context):
            if request.requirement.id in CachedDB.all_reqs and \
                    CachedDB.all_reqs[request.requirement.id] == request.requirement.s_name:
                CachedDB.all_reqs.pop(request.requirement.id)
            else:
                CachedDB.all_reqs[request.requirement.id] = request.requirement.s_name
            return pb2.Empty()

        def vacancyUpdated(self, request, context):
            if request.vacancy.id in CachedDB.all_vacs and CachedDB.all_vacs[request.vacancy.id] == request.vacancy.s_name:
                CachedDB.all_vacs.pop(request.vacancy.id)
            else:
                CachedDB.all_vacs[request.vacancy.id] = request.vacancy.s_name
            KeyboardsService.fillVacsKb()
            return pb2.Empty()

        def reqToVacUpdated(self, request, context):
            vac_id = request.vacancyRequirement.n_vacancy
            req_id = request.vacancyRequirement.n_requirement
            if request.delete:
                if vac_id in CachedDB.req_to_vac and req_id in CachedDB.req_to_vac[vac_id]:
                    CachedDB.req_to_vac[vac_id].pop(CachedDB.req_to_vac[vac_id].index(req_id))
                    if len(CachedDB.req_to_vac[vac_id]) == 0:
                        CachedDB.req_to_vac.pop(vac_id)
            else:
                if vac_id in CachedDB.req_to_vac:
                    if req_id not in CachedDB.req_to_vac[vac_id]:
                        CachedDB.req_to_vac[vac_id].append(vac_id)
                else:
                    CachedDB.req_to_vac[vac_id] = [req_id]
            print(CachedDB.req_to_vac)
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
