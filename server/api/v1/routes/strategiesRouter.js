var Router = require('express');
var router = new Router();
const StrategiesController = require('../../../core/objects/interviewStrategies/strategiesController');

router.post('/:n_vacancy', StrategiesController.create);
router.get('/:n_vacancy', StrategiesController.getAll);

router.delete('/:n_vacancy/:n_serial', StrategiesController.delete);
router.get('/:n_vacancy/:n_serial', StrategiesController.get);

module.exports = router;