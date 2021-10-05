var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Users = Sequelize.define('t_users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    s_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    s_password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    e_mail: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Users;