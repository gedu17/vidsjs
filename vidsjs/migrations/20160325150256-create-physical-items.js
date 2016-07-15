'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('physical_items', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        pid: {
            allowNull: false,
            type: Sequelize.INTEGER
        },
        type: {
            allowNull: false,
            type: Sequelize.INTEGER
        },
        upid: {
            allowNull: false,
            type: Sequelize.INTEGER
        }
        name: {
            allowNull: false,
            type: Sequelize.STRING
        },
        path: {
            allowNull: false,
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
    return queryInterface.dropTable('physical_items');
  }
};
