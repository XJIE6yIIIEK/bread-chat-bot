const GraphRepository = require('./graphRepository');
var ErrorHandler = require('../../errorHandlers/errorHandler');
var {Op} = require('sequelize');

class GraphService {
    async create(data, next){
        const graph = await GraphRepository.create(data, next);        
        return graph;
    }

    async getAll(next){
        const graphs = await GraphRepository.getAll();
        return graphs;
    }

    async delete(edgeData, next){
        var edge = await GraphRepository.get({
            where: {
                [Op.or]: [
                    {
                        s_first_command: edgeData.s_fc,
                        s_second_command: edgeData.s_sc
                    },
                    {
                        s_first_command: edgeData.s_sc,
                        s_second_command: edgeData.s_fc
                    }
                ]
            }
        });

        if(!edge){
            return next(ErrorHandler.notFound('Пара команд не найдена'));
        }

        await GraphRepository.delete(edge);
    }

    async get(commandId){
        var graph = await GraphRepository.getAll({
            where: {
                [Op.or]: [
                    {
                        s_first_command: commandId    
                    },
                    {
                        s_second_command: commandId
                    }
                ]
            }
        });

        return graph;
    }
}

module.exports = new GraphService();