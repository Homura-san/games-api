const Sequelize = require('sequelize')
const connection = new Sequelize('gameshop', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = connection;