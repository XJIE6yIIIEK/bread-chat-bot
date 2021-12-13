var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var FormToVacs = Sequelize.define('t_form_to_vacs', {
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
    n_form: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 't_forms',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
});

module.exports = FormToVacs;