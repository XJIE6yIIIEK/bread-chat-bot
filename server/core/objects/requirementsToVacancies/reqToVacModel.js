var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var ReqToVacs = Sequelize.define('t_req_to_vac', {
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
    n_requirement: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 't_requirements',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
});

module.exports = ReqToVacs;