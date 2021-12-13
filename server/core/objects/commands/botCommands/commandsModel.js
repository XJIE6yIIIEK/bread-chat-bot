var Sequelize = require('../../../db/db');
var {DataTypes} = require('sequelize');

var Commands = Sequelize.define('t_company_info', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    s_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    s_message: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Commands;