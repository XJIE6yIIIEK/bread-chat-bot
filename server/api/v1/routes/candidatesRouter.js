var Router = require('express');
var router = new Router();
const CandidatesController = require('../../../core/objects/candidates/candidatesController');

var AuthMiddleware = require('../../../core/middlewares/authMiddleware');

router.get('/', AuthMiddleware, CandidatesController.getAll);

router.delete('/:id', AuthMiddleware, CandidatesController.delete);
router.get('/:id', AuthMiddleware, CandidatesController.get);

router.post('/:id/setMeeting/:n_vacancy', AuthMiddleware, CandidatesController.setMeeting);

module.exports = router;