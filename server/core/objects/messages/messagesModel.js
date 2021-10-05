var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Messages = Sequelize.define('t_messages', {
    s_tg_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        references: {
            model: 't_users',
            key: 's_tg_id'
        }
    },
    d_date: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true
    },
    b_bot_message: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    s_text: {
        type: DataTypes.STRING,
        allowNull: true
    },
    s_command: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Messages;