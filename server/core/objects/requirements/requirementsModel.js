var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Requirements = Sequelize.define('t_requirements', {
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
    s_name: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    s_text: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Requirements;