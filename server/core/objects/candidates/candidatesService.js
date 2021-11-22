const CandidatesRepository = require('./candidatesRepository');
const ResumesRepository = require('../resumes/resumesRepository');
const Sequelize = require('../../db/db');
const { QueryTypes } = require('sequelize');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class CandidatesService {
    async getAll(next){
        const candidates = await CandidatesRepository.getAll();
        return candidates;
    }

    async delete(candidateId, next){
        var candidate = await CandidatesRepository.get({
            where: {
                id: candidateId
            }
        });

        if(!candidate){
            return next(ErrorHandler.notFound('Кандидат не найден'));
        }

        await CandidatesRepository.delete(candidate);
    }

    async get(candidateId, next){
        var candidate = await CandidatesRepository.get({
            where: {
                id: candidateId
            }
        });

        if(!candidate){
            return next(ErrorHandler.notFound('Кандидат не найден'));
        }

        const resume = await ResumesRepository.getAll({
            where: {
                n_candidate: candidate.id
            }
        });

        const appropriateVacancies = await Sequelize.query(
            'SELECT id, s_name FROM t_vacancies ' +
            'WHERE ( ' +
            '        SELECT COUNT(*) FROM t_req_to_vacs ' +
            '        WHERE t_vacancies.id = t_req_to_vacs.n_vacancy ' +
            '    ) = (	' +
            '        SELECT COUNT(*) FROM t_req_to_vacs ' +
            '        JOIN t_resumes ' +
            '        ON t_resumes.n_requirement = t_req_to_vacs.n_requirement ' +
            '        WHERE t_req_to_vacs.n_vacancy = t_vacancies.id ' +
            '        AND t_resumes.n_candidate = ' + candidate.id +
            '    )',
            { type: QueryTypes.SELECT }
        );

        return {
            candidate: candidate,
            resume: resume,
            appropriateVacancies: appropriateVacancies
        };
    }
}

module.exports = new CandidatesService();