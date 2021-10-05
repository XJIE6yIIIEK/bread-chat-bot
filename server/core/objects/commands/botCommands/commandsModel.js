var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Commands = Sequelize.define('t_bot_messages', {
    s_command: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    s_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    s_message: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Commands;