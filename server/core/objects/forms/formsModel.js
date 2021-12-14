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
        allowNull: true
    },
    b_general: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = Forms;