var Sequelize = require('../../../db/db');
var {DataTypes} = require('sequelize');

var Commands = Sequelize.define('t_company_info', {
    s_name: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    s_message: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Commands;