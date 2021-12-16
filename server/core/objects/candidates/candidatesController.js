var CandidatesService = require('./candidatesService');
var CalendarService = require('../calendar/calendarService');
const ErrorHandler = require('../../errorHandlers/errorHandler');

class CandidatesController {
    async delete(req, res, next){
        var candidateId = req.params.id;
        await CandidatesService.delete(candidateId, next);
        return res.status(203).end();
    }

    async get(req, res, next){
        var candidateId = req.params.id;
        const candidate = await CandidatesService.get(candidateId, req.user.id);
        if(candidate instanceof ErrorHandler){
            return next(candidate);
        }
        return res.status(200).json(candidate).end();
    }

    async getAll(req, res, next){
        var candidates = await CandidatesService.getAll(req.user.id);
        return res.status(200).json(candidates).end();
    }

    async setMeeting(req, res, next){
        var userId = req.user.id;
        var candidateId = req.params.n_candidate;
        var vacancyId = req.params.n_vacancy;
        var meetingData = req.body;

        await CalendarService.setMeeting(
            userId,
            candidateId,
            vacancyId,
            meetingData,
            async (result) => {
                if(result instanceof ErrorHandler){
                    return next(result);
                }

                return res.status(200).json(result).end();
            }
        );
    }

    async deleteMeeting(req, res, next){
        var data = {
            n_user: req.user.id,
            n_vacancy: req.params.n_vacancy,
            n_candidate: req.params.n_candidate
        }

        CalendarService.rejectMeeting(
            data,
            [],
            () => {
                return res.status(204).end();
            }
        );
    }
}

module.exports = new CandidatesController();