var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Sessions = Sequelize.define('t_current_sessions', {
    s_tg_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        references: {
            model: 't_candidates',
            key: 's_tg_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    s_command: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 't_bot_messages',
            key: 's_command'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
});

module.exports = Sessions;