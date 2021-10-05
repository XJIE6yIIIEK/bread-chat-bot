var Sequelize = require('../../db/db');
var {DataTypes} = require('sequelize');

var Candidates = Sequelize.define('t_candidates', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    s_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    d_birth_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    s_phone_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    s_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    e_mail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    s_tg_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    b_memo_sended: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
});

module.exports = Candidates;