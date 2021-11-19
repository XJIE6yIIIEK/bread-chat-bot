const CandidatesRepository = require('./candidatesRepository');
const ResumesRepository = require('../resumes/resumesRepository');
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

        return {
            candidate: candidate,
            resume: resume
        };
    }
}

module.exports = new CandidatesService();