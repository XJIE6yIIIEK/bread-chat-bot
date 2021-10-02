var Router = require('express');
var router = new Router();

var CandidatesRouter = require('./candidatesRouter');
var CommandsRouter = require('./commandsRouter');
var GraphRouter = require('./graphRouter');
var MessagesRouter = require('./messagesRouter');
var RequirementsRouter = require('./requirementsRouter');
var UsersRouter = require('./usersRouter');
var ResumesRouter = require('./resumesRouter');
var StrategiesRouter = require('./strategiesRouter');
var VacanciesRouter = require('./vacanciesRouter');

router.use('/users', UsersRouter);
router.use('/candidates', CandidatesRouter);
router.use('/commands', CommandsRouter);
router.use('/commandGraphs', GraphRouter);
router.use('/messages', MessagesRouter);
router.use('/requirements', RequirementsRouter);
router.use('/resumes', ResumesRouter);
router.use('/strategies', StrategiesRouter);
router.use('/vacancies', VacanciesRouter);

module.exports = router;
