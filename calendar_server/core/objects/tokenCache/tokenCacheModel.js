var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var TokensCache = Sequelize.define('t_cache', {
    s_cache: {
        type: DataTypes.TEXT('long'),
        primaryKey: true
    }
});

module.exports = TokensCache;