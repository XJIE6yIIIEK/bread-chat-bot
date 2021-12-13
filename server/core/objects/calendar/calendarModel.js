var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Calendar = Sequelize.define('t_meetings', {
    n_candidate: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 't_candidates',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    n_vacancy: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 't_vacancies',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    n_user: {
        type: DataTypes.INTEGER,
        references: {
            model: 't_users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    n_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        references: {
            model: 't_meeting_statuses',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    d_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    s_duration: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Calendar;