var Router = require('express');
var router = new Router();
const VacanciesController = require('../../../core/objects/vacancies/vacanciesController');

router.post('/', VacanciesController.create);
router.get('/', VacanciesController.getAll);

router.patch('/:id', VacanciesController.patch);
router.delete('/:id', VacanciesController.delete);
router.get('/:id', VacanciesController.get);

module.exports = router;