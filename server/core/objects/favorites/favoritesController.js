const FavoritesService = require('./favoritesService');

class FavoritesController {
    async create(req, res, next){
        req.user = {
            id: 1
        };
        var userId = req.user.id;
        var candidateId = req.params.n_candidate;

        var favorite = await FavoritesService.create(userId, candidateId);
        return res.status(200).json(favorite).end();
    }

    async delete(req, res, next){
        req.user = {
            id: 1
        };
        var userId = req.user.id;
        var candidateId = req.params.n_candidate;

        var favorite = await FavoritesService.delete(userId, candidateId);
        return res.status(203).end();
    }
}

module.exports = new FavoritesController();