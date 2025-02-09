// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/mysql'); // MySQL connection

// const User = sequelize.define('User', {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     firstName: { type: DataTypes.STRING, allowNull: false },
//     lastName: { type: DataTypes.STRING, allowNull: false },
//     email: { type: DataTypes.STRING, allowNull: false, unique: true },
//     password: { type: DataTypes.STRING, allowNull: false }
// }, {
//     timestamps: false
// });

// module.exports = User;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql'); // MySQL connection

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
}, {
    timestamps: false // No createdAt/updatedAt fields
});

module.exports = User;
