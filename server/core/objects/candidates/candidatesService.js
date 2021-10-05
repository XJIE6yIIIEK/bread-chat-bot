const CandidatesRepository = require('./candidatesRepository');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class CommandsService {
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
            return next(ErrorHandler.notFound('Команда бота не найдена'));
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
            return next(ErrorHandler.notFound('Команда бота не найдена'));
        }

        return candidate;
    }
}

module.exports = new CommandsService();