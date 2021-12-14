var Router = require('express');
var router = new Router();
const VacanciesController = require('../../../core/objects/vacancies/vacanciesController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.post('/', /*AuthMiddleware,*/ VacanciesController.create);
router.get('/', /*AuthMiddleware,*/ VacanciesController.getAll);

router.put('/:id', /*AuthMiddleware,*/ VacanciesController.patch);
router.delete('/:id', /*AuthMiddleware,*/ VacanciesController.delete);
router.get('/:id', /*AuthMiddleware,*/ VacanciesController.get);

module.exports = router;