var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Requirements = Sequelize.define('t_requirements', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement: true
    },
    s_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Requirements;