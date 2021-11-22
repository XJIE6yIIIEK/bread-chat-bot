var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Resumes = Sequelize.define('t_resumes', {
    n_candidate: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 't_candidates',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    n_requirement: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 't_requirements',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    s_value: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Resumes;