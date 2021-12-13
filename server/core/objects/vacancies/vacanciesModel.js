var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Vacancies = Sequelize.define('t_vacancies', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    s_name: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Vacancies;