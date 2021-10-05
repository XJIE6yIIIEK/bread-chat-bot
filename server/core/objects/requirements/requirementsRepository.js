const Requirements = require('./requirementsModel');

class RequirementsRepository {
    async create(data){
        var requirement = await Requirements.create(data);
        return requirement;
    }

    async patch(requirement){
        requirement.save();
    }

    async delete(requirement){
        requirement.destroy();
    }

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