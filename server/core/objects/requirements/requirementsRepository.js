const Requirements = require('./requirementsModel');

class RequirementsRepository {
    async get(conditions = {}){
        var requirement = await Requirements.findOne(conditions);
        return requirement;
    }

    async getAll(conditions = {}){
        var requirements = await Requirements.findAll(conditions);
        return requirements;
    }
}

module.exports = new RequirementsRepository();