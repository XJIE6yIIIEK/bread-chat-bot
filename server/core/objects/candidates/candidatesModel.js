var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Candidates = Sequelize.define('t_candidates', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    n_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 't_candidate_statuses',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    s_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    d_birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    s_phone_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    s_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    e_mail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    s_tg_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    s_external_resumes: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Candidates;