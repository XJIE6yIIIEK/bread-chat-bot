var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var MeetingStatuses = Sequelize.define('t_meeting_statuses', {
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

module.exports = MeetingStatuses;