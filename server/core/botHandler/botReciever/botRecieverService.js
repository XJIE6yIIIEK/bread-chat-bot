var VacanciesRepository = require('../../objects/vacancies/vacanciesRepository');
var RequirementsRepository = require('../../objects/requirements/requirementsRepository');
var CommandsRepository = require('../../objects/commands/botCommands/commandsRepository');
var CandidatesRepository = require('../../objects/candidates/candidatesRepository');
var ResumesRepository = require('../../objects/resumes/resumesRepository');
var ReqToVacsRepository = require('../../objects/requirementsToVacancies/reqToVacRepository');

class BotRecieverService {
    async getCache(){
        const companyInfos = await CommandsRepository.getAll({
            attributes: [
                's_name',
                's_message'
            ]
        });

        const requirements = await RequirementsRepository.getAll({
            attributes: [
                'id',
                's_name'
            ]
        });

        const reqToVacs = await ReqToVacsRepository.getAll({
            attributes: [
                'n_vacancy',
                'n_requirement'
            ],
            order: [
                ['n_vacancy', 'ASC'],
                ['n_requirement', 'ASC']
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
            requirements: requirements,
            reqToVacs: reqToVacs,
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
                'e_mail'
            ],
            where: {
                s_tg_id: candidateInfo.s_tg_id
            }
        });

        if(!candidate){
            candidate = await CandidatesRepository.create(candidateInfo);

            return candidate;
        } else {
            if(candidateInfo.name){
                candidate.s_name = candidateInfo.s_name;
            }

            if(candidateInfo.phoneNumber){
                candidate.s_phone_number = candidateInfo.s_phone_number;
            }

            if(candidateInfo.address){
                candidate.s_address = candidateInfo.s_address;
            }

            if(candidateInfo.email){
                candidate.e_mail = candidateInfo.e_mail;
            }

            await CandidatesRepository.patch(candidate);

            return candidate;
        }
    }

    async addCandidateResume(candidate, resumesInfo){
        resumesInfo.forEach(async (resumeElement) => {
            var resume = await ResumesRepository.get({
                where: {
                    n_candidate: candidate.id,
                    n_requirement: resumeElement.n_requirement
                }
            });

            if(!resume){
                resumeElement.n_candidate = candidate.id;
                await ResumesRepository.create(resumeElement);
            } else {
                if(resumeElement.s_value){
                    resume.s_value = resumeElement.s_value;
                }

                await ResumesRepository.patch(resume);
            }
        });
    }

    async getCandidate(tgId){
        const candidate = await CandidatesRepository.get({
            attributes: [
                'id',
                's_name',
                'd_birth_date',
                's_phone_number',
                's_address',
                'e_mail'
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

        return {
            candidateMainInfo: candidate,
            candidateResumes: resume
        };
    }
}

module.exports = new BotRecieverService();