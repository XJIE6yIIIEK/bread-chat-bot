var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Calendar = Sequelize.define('t_users', {
    n_user: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    s_graph_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Calendar;