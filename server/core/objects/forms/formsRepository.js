const Forms = require('./formsModel');

class FormsRepository {
    async create(data){
        var form = await Forms.create(data);
        return form;
    }

    async patch(form){
        form.save();
    }

    async delete(form){
        form.destroy();
    }

    async get(conditions = {}){
        var form = await Forms.findOne(conditions);
        return form;
    }

    async getAll(conditions = {}){
        var forms = await Forms.findAll(conditions);
        return forms;
    }
}

module.exports = new FormsRepository();