var VacanciesRepository = require('../../objects/vacancies/vacanciesRepository');
var FormsRepository = require('../../objects/forms/formsRepository');
var CommandsRepository = require('../../objects/commands/botCommands/commandsRepository');
var CandidatesRepository = require('../../objects/candidates/candidatesRepository');
var ResumesRepository = require('../../objects/resumes/resumesRepository');
var FormToVacsRepository = require('../../objects/formsToVacancies/formToVacRepository');
var WantedVacanciesRepository = require('../../objects/wantedVacancy/wantedVacancyRepository');
var DBRepository = require('../../db/dbRepository');

class BotRecieverService {
    async getCache(){
        const companyInfos = await CommandsRepository.getAll({
            attributes: [
                'id',
                's_name',
                's_message'
            ]
        });

        const forms = await FormsRepository.getAll({
            attributes: [
                'id',
                's_name',
                'b_general'
            ]
        });

        const formToVacs = await FormToVacsRepository.getAll({
            attributes: [
                'n_vacancy',
                'n_form'
            ],
            order: [
                ['n_vacancy', 'ASC'],
                ['n_form', 'ASC']
            ]
        });

        const vacancies = await VacanciesRepository.getAll({
            attributes: [
                'id',
                's_name'
            ]
        });
        
        return {
            companyInfos: companyInfos,
            forms: forms,
            formToVacs: formToVacs,
            vacancies: vacancies
        };
    }

    async addCandidateInfo(candidateInfo){
        var candidate = await CandidatesRepository.get({
            attributes: [
                'id',
                's_name',
                'd_birth_date',
                's_phone_number',
                's_address',
                'e_mail',
                's_external_resumes'
            ],
            where: {
                s_tg_id: candidateInfo.s_tg_id
            }
        });

        if(!candidate){
            candidateInfo.n_status = 1;
            candidate = await CandidatesRepository.create(candidateInfo);

            return candidate;
        } else {
            var updated = false;

            if(candidateInfo.s_name){
                candidate.s_name = candidateInfo.s_name;
                updated = true;
            }

            if(candidateInfo.s_phone_number){
                candidate.s_phone_number = candidateInfo.s_phone_number;
                updated = true;
            }

            if(candidateInfo.s_address){
                candidate.s_address = candidateInfo.s_address;
                updated = true;
            }

            if(candidateInfo.e_mail){
                candidate.e_mail = candidateInfo.e_mail;
                updated = true;
            }

            if(candidateInfo.s_external_resumes){
                candidate.s_external_resumes = candidateInfo.s_external_resumes;
                updated = true;
            }

            if(updated){
                candidate.n_status = 3;
            }

            await CandidatesRepository.patch(candidate);

            return candidate;
        }
    }

    async addCandidateResume(candidate, resumesInfo){
        var updated = false;

        resumesInfo.forEach(async (resumeElement) => {
            var resume = await ResumesRepository.get({
                where: {
                    n_candidate: candidate.id,
                    n_form: resumeElement.n_form
                }
            });

            if(!resume){
                resumeElement.n_candidate = candidate.id;
                await ResumesRepository.create(resumeElement);
                updated = true;
            } else {
                if(resumeElement.s_value){
                    resume.s_value = resumeElement.s_value;
                    updated = true;
                }

                await ResumesRepository.patch(resume);
            }
        });

        if(updated){
            candidate.n_status = 3;
            await CandidatesRepository.patch(candidate);
        }
    }

    async addWantedVacancy(candidate, vacancy){
        var wantedVacancy = await WantedVacanciesRepository.get({
            where: {
                n_candidate: candidate.id,
                n_vacancy: vacancy
            }
        });

        if(!wantedVacancy){
            await WantedVacanciesRepository.create({
                n_candidate: candidate.id,
                n_vacancy: vacancy
            });
        }
    }

    async getCandidate(tgId){
        const candidate = await CandidatesRepository.get({
            attributes: [
                'id',
                's_name',
                'd_birth_date',
                's_phone_number',
                's_address',
                'e_mail',
                's_tg_id',
                's_external_resumes'
            ],
            where: {
                s_tg_id: tgId
            }
        });

        if(!candidate){
            return {
                candidateMainInfo: {},
                candidateResumes: []
            };
        }

        const resume = await ResumesRepository.getAll({
            where: {
                n_candidate: candidate.id
            }
        });

        const meetings = await DBRepository.rawQuery(
            'SELECT t_meetings.n_vacancy, t_meetings.n_status, t_meeting_statuses.s_name AS s_status, to_char(t_meetings.d_date, "DD.MM.YYYY HH:mm") AS d_date FROM t_meetings ' +
            `WHERE n_candidate = ${candidate.id} ` +
            'JOIN t_meeting_statuses ' +
            'ON t_meeting_statuses.id = t_meetings.n_status',
            'SELECT'
        );

        return {
            candidateMainInfo: candidate,
            candidateResumes: resume,
            candidateMeetings: meetings
        };
    }
}

module.exports = new BotRecieverService();