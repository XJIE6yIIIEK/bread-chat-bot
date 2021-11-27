var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var CandidateStatuses = Sequelize.define('t_candidate_statuses', {
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

module.exports = CandidateStatuses;