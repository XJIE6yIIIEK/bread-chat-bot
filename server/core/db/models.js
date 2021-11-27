var CandidateStatuses = require('../objects/candidateStatuses/candidateStatusesModel');
var Users = require('../objects/users/usersModel');
var Candidates = require('../objects/candidates/candidatesModel');
var Commands = require('../objects/commands/botCommands/commandsModel');
var Forms = require('../objects/forms/formsModel');
var Vacancies = require('../objects/vacancies/vacanciesModel');
var FormToVacs = require('../objects/formsToVacancies/formToVacModel');
var Resumes = require('../objects/resumes/resumesModel');
var Calendar = require('../objects/calendar/calendarModel');
var Favorites = require('../objects//favorites/favoritesModel');
var WantedVacancies = require('../objects/wantedVacancy/wantedVacancyModel');

module.exports = {
    CandidateStatuses,
    Users,
    Candidates,
    Commands,
    Forms,
    Vacancies,
    FormToVacs,
    Resumes,
    Calendar,
    Favorites,
    WantedVacancies
};