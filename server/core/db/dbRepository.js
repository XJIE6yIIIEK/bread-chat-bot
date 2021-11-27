const Sequelize = require('./db');
const { QueryTypes } = require('sequelize');

class DBRepository {
    static async getQType(qtype){
        switch(qtype){
            case 'SELECT': {
                return QueryTypes.SELECT;
            }
        }
    }

    static async rawQuery(query, rawQType){
        var qtype = DBRepository.getQType(rawQType);
        var result = await Sequelize.query(query, {type: qtype});
        return result;
    }
}

module.exports = DBRepository;