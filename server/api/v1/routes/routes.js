var Router = require('express');
var router = new Router();

var CandidatesRouter = require('./candidatesRouter');
var CommandsRouter = require('./commandsRouter');
var RequirementsRouter = require('./requirementsRouter');
var UsersRouter = require('./usersRouter');
var ResumesRouter = require('./resumesRouter');
var VacanciesRouter = require('./vacanciesRouter');
var ReqToVacsRouter = require('./reqToVacRouter');

router.use('/users', UsersRouter);
router.use('/candidates', CandidatesRouter);
router.use('/commands', CommandsRouter);
router.use('/requirements', RequirementsRouter);
router.use('/resumes', ResumesRouter);
router.use('/vacancies', VacanciesRouter);
router.use('/reqToVacs', ReqToVacsRouter);

module.exports = router;
