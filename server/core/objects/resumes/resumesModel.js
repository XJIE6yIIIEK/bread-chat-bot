var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Resumes = Sequelize.define('t_resumes', {
    n_candidate: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 't_canditates',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    n_vacancy: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 't_requirements',
            key: 'n_vacancy'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    s_requirement_name: {
        type: DataTypes.STRING,
        primaryKey: true,
        references: {
            model: 't_requirements',
            key: 's_name'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    s_value: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Resumes;