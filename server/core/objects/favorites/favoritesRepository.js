const Favorites = require('./favoritesModel');

class FavoritesRepository {
    async create(data){
        var favorite = await Favorites.create(data);
        return favorite;
    }

    async delete(favorite){
        favorite.destroy();
    }

    async get(conditions = {}){
        var favorite = await Favorites.findOne(conditions);
        return favorite;
    }

    async getAll(conditions = {}){
        var favorites = await Favorites.findAll(conditions);
        return favorites;
    }
}

module.exports = new FavoritesRepository();