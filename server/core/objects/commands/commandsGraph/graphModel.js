var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Graph = Sequelize.define('t_available_messages', {
    s_first_command: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    s_second_command: {
        type: DataTypes.STRING,
        primaryKey: true
    }
});

module.exports = Graph;