const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables

const sequelize = new Sequelize('mydatabase', 'root', 'admin', {
    host: 'localhost',
    dialect: 'mysql'
});

const User = require('../models/user_mysql'); // Import User model

sequelize.sync()
    .then(() => console.log('MySQL Tables Synced...'))
    .catch(err => console.error('Error syncing MySQL tables:', err));


sequelize.authenticate()
    .then(() => console.log('MySQL Connected...'))
    .catch(err => console.error('MySQL Connection Error:', err));

module.exports = sequelize;
