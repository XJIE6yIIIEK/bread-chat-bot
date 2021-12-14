var Users = require('./usersModel');

class UsersRepository{
    async create(data){
        var user = await Users.create(data);
        return user;
    }

    async get(conditions = {}){
        var user = await Users.findOne(conditions);
        return user;
    }

    async patch(user){
        user.save();
    }
}

module.exports = new UsersRepository();