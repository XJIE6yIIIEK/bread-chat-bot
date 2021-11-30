const FavoritesRepository = require('./favoritesRepository');

class FavoritesService {
    async create(userId, candidateId){
        var data = {
            n_user: userId,
            n_candidate: candidateId
        };

        var favorite = await FavoritesRepository.create(data);
        return favorite;
    }

    async delete(userId, candidateId){
        var favorite = await FavoritesRepository.get({
            where: {
                n_user: userId,
                n_candidate: candidateId
            }
        });

        if(!favorite){
            return;
        }

        await FavoritesRepository.destroy(favorite);
        return;
    }
}

module.exports = new FavoritesService();