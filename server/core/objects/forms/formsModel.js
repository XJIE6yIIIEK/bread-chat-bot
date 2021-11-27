var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Forms = Sequelize.define('t_forms', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    s_name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Forms;