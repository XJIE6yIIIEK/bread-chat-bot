var Graph = require('./graphModel');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class GraphRepository {
    async create(data, next){
        try{
            var graph = await Graph.create(data);
            return graph;
        } catch(e) {
            next(ErrorHandler.elementExist('Такая команда уже существует'));
        }
    }

    async getAll(conditions = {}){
        var graph = await Graph.findAll(conditions);
        return graph;
    }

    async get(conditions = {}){
        var edge = await Graph.findOne(conditions);
        return edge;
    }

    async delete(edge){
        edge.destroy();
    }
}

module.exports = new GraphRepository();