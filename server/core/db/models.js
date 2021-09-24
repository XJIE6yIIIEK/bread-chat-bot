var Users = require('../objects/users/usersModel');
var Candidates = require('../objects/candidates/candidatesModel');
var Commands = require('../objects/commands/botCommands/commandsModel');
var Graph = require('../objects/commands/commandsGraph/graphModel');
var Strategies = require('../objects/interviewStrategies/strategiesModel');
var Requirements = require('../objects/requirements/requirementsModel');
var Messages = require('../objects/messages/messagesModel');
var Sessions = require('../objects/sessions/sessionsModel');
var Vacancies = require('../objects/vacancies/vacanciesModel');
var Resumes = require('../objects/resumes/resumesModel');

module.exports = {
    Candidates,
    Commands,
    Graph,
    Strategies,
    Messages,
    Requirements,
    Resumes,
    Sessions,
    Users,
    Vacancies
};