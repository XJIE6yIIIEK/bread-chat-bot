var Resumes = require('./resumesModel');
var ErrorHandler = require('../../errorHandlers/errorHandler');

class ResumesRepository {
    async create(data){
        var resume = await Resumes.create(data);
        return resume;
    }

    async patch(resume){
        resume.save();
    }

    async get(condition){
        var resume = await Resumes.findOne(condition);
        return resume;
    }

    async getAll(conditions = {}){
        var resumes = await Resumes.findAll(conditions);
        return resumes;
    }
}

module.exports = new ResumesRepository();