'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('settings', {
            id: {
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                unique: true
            },
            value: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('settings');
  }
};