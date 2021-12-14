const CandidateStatusesRepository = require('../objects/candidateStatuses/candidateStatusesRepository');
const MeetingStatusesRepository = require('../objects/meetingStatuses/meetingStatusesRepository');

module.exports = async () => {
    var candidateStatusNotReaded = await  CandidateStatusesRepository.get({
        where: {
            id: 1
        }
    });

    var candidateStatusReaded = await  CandidateStatusesRepository.get({
        where: {
            id: 2
        }
    });

    var candidateStatusUpdated = await  CandidateStatusesRepository.get({
        where: {
            id: 3
        }
    });

    var meetingStatusSuggested = await  MeetingStatusesRepository.get({
        where: {
            id: 1
        }
    });

    var meetingStatusAccepted = await  MeetingStatusesRepository.get({
        where: {
            id: 2
        }
    });

    var meetingStatusRejectedByCandidate = await  MeetingStatusesRepository.get({
        where: {
            id: 3
        }
    });

    var meetingStatusTimeout = await  MeetingStatusesRepository.get({
        where: {
            id: 4
        }
    });

    if(!candidateStatusNotReaded){
        await CandidateStatusesRepository.create({
            s_name: 'Ожидает рассмотрения'
        });
    }

    if(!candidateStatusReaded){
        await CandidateStatusesRepository.create({
            s_name: 'Просмотренно'
        });
    }

    if(!candidateStatusUpdated){
        await CandidateStatusesRepository.create({
            s_name: 'Обновлено'
        });
    }

    if(!meetingStatusSuggested){
        await MeetingStatusesRepository.create({
            s_name: 'Предложено время'
        });
    }

    if(!meetingStatusAccepted){
        await MeetingStatusesRepository.create({
            s_name: 'Собеседование назначено'
        });
    }

    if(!meetingStatusRejectedByCandidate){
        await MeetingStatusesRepository.create({
            s_name: 'Предложенное время отклонено кандидатом'
        });
    }

    if(!meetingStatusTimeout){
        await MeetingStatusesRepository.create({
            s_name: 'Превышено время ожидания ответа от кандидата'
        });
    }
}