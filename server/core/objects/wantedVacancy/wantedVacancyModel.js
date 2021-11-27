var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var WantedVacancies = Sequelize.define('t_wanted_vacancies', {
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
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
});

module.exports = WantedVacancies;