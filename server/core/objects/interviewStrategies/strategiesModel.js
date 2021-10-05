var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Strategies = Sequelize.define('t_interview_strategies', {
    n_vacancy: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 't_vacancies',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    n_serial: {
        type: DataTypes.INTEGER,
        primaryKey: true
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

module.exports = Strategies;