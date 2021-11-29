var Router = require('express');
var router = new Router();

var CandidatesRouter = require('./candidatesRouter');
var CommandsRouter = require('./commandsRouter');
var FormsRouter = require('./formsRouter');
var UsersRouter = require('./usersRouter');
var ResumesRouter = require('./resumesRouter');
var VacanciesRouter = require('./vacanciesRouter');
var FormToVacsRouter = require('./formToVacRouter');
var AuthRouter = require('./authRouter');

router.use('/auth', AuthRouter);
router.use('/users', UsersRouter);
router.use('/candidates', CandidatesRouter);
router.use('/commands', CommandsRouter);
router.use('/forms', FormsRouter);
router.use('/resumes', ResumesRouter);
router.use('/vacancies', VacanciesRouter);
router.use('/formToVacs', FormToVacsRouter);

module.exports = router;
