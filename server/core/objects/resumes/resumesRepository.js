var Resumes = require('./resumesModel');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class ResumesRepository {
    async getAll(conditions = {}){
        var commands = await Resumes.findAll(conditions);
        return commands;
    }
}

module.exports = new ResumesRepository();