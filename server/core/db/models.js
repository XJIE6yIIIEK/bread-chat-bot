var Users = require('../objects/users/usersModel');
var Candidates = require('../objects/candidates/candidatesModel');
var Commands = require('../objects/commands/botCommands/commandsModel');
var Requirements = require('../objects/requirements/requirementsModel');
var Vacancies = require('../objects/vacancies/vacanciesModel');
var Resumes = require('../objects/resumes/resumesModel');
var ReqToVacs = require('../objects/requirementsToVacancies/reqToVacModel');

module.exports = {
    Candidates,
    Commands,
    Requirements,
    Resumes,
    Users,
    Vacancies,
    ReqToVacs
};