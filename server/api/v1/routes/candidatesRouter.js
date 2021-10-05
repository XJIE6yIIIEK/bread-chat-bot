var Router = require('express');
var router = new Router();
const CandidatesController = require('../../../core/objects/candidates/candidatesController');

router.get('/', CandidatesController.getAll);

router.delete('/:id', CandidatesController.delete);
router.get('/:id', CandidatesController.get);

module.exports = router;