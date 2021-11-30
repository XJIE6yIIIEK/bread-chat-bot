const CandidatesRepository = require('./candidatesRepository');
const DBRepository = require('../../db/dbRepository');
const CandidateStatusesRepository = require('../candidateStatuses/candidateStatusesRepository');
const Sequelize = require('../../db/db');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class CandidatesService {
    async getAll(userId){
        const candidates = await DBRepository.rawQuery(
            'WITH t_user_favorites AS ( ' +
            '   SELECT * FROM t_favorites ' +
            '   WHERE t_favorites.n_user = ' + userId + ' ' +
            ') ' +
            'SELECT t_candidates.id, t_candidates.s_name, t_candidate_statuses.s_name AS s_status, t_user_favorites.n_candidate AS b_favorite FROM t_candidates ' +
            'JOIN t_candidate_statuses ' +
            'ON t_candidate_statuses.id = t_candidates.n_status ' +
            'LEFT JOIN t_user_favorites ' +
            'ON t_user_favorites.n_candidate = t_candidates.id ' +
            'ORDER BY t_user_favorites.n_candidate ASC, t_candidates.id ASC',
            'SELECT'
        );
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

    async get(candidateId, userId){
        var candidate;
        try{
            candidate = await CandidatesRepository.get({
                attributes: [
                    'id',
                    's_name',
                    'n_status',
                    [Sequelize.fn('to_char', Sequelize.col('d_birth_date'), 'DD/MM/YYYY'), 'd_birth_date'],
                    's_phone_number',
                    's_address',
                    'e_mail',
                    's_external_resumes'
                ],
                where: {
                    id: candidateId
                }
            });
        } catch(e) {
            return ErrorHandler.badRequest('Неверно указан id кандидата');
        }

        if(!candidate){
            return ErrorHandler.notFound('Кандидат не найден');
        }       

        const resume = await DBRepository.rawQuery(
            'WITH t_candidate_resumes AS ( ' +
            '    SELECT * FROM t_resumes ' +
            '    WHERE n_candidate = ' + candidate.id + ' ' +
            ') ' +
            'SELECT t_forms.s_name,  ' +
            '       t_candidate_resumes.s_value,  ' +
            '       t_candidate_resumes."createdAt",  ' +
            '       t_candidate_resumes."updatedAt"  ' +
            'FROM t_candidate_resumes ' +
            'JOIN t_forms ' +
            'ON t_forms.id = t_candidate_resumes.n_form',
            'SELECT'
        );

        const appropriateVacancies = await DBRepository.rawQuery(
            'WITH temp_wanted_vacancies AS ( ' +
            '   SELECT n_vacancy, TRUE AS b_wanted ' +
            '   FROM t_wanted_vacancies ' +
            '   WHERE n_candidate = ' + candidate.id +
            ') ' +
            'SELECT t_vacancies.id, t_vacancies.s_name, temp_wanted_vacancies.b_wanted FROM t_vacancies ' +
            'LEFT JOIN temp_wanted_vacancies ' +
            'ON temp_wanted_vacancies.n_vacancy = t_vacancies.id ' +
            'WHERE ( ' +
            '        SELECT COUNT(*) FROM t_form_to_vacs ' +
            '        WHERE t_vacancies.id = t_form_to_vacs.n_vacancy ' +
            '    ) = (	' +
            '        SELECT COUNT(*) FROM t_form_to_vacs ' +
            '        JOIN t_resumes ' +
            '        ON t_resumes.n_form = t_form_to_vacs.n_form ' +
            '        WHERE t_form_to_vacs.n_vacancy = t_vacancies.id ' +
            '        AND t_resumes.n_candidate = ' + candidate.id +
            '    )',
            'SELECT'
        );

        const status = await CandidateStatusesRepository.get({
            where: {
                id: candidate.n_status
            }
        });

        if(candidate.n_status != 2){
            candidate.n_status = 2;
            await CandidatesRepository.patch(candidate);
        }

        const favorite = await DBRepository.rawQuery(
            'SELECT t_users.s_name FROM t_users ' +
            'JOIN t_favorites ' +
            'ON t_favorites.n_user = t_users.id ' +
            'WHERE t_favorites.n_candidate = ' + candidate.id + ' AND t_favorites.n_user = ' + userId,
            'SELECT'
        );

        return {
            candidate: candidate,
            resume: resume,
            appropriateVacancies: appropriateVacancies,
            candidateStatus: status,
            favorite: (favorite == null) ? false : true
        };
    }
}

module.exports = new CandidatesService();