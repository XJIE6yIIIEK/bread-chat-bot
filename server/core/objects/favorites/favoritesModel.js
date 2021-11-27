var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Favorites = Sequelize.define('t_favorites', {
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
    n_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 't_users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
});

module.exports = Favorites;