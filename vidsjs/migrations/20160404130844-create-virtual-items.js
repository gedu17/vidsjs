'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('virtual_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uid: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      iid: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      pid: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      seen: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      deleted: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      type: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    return queryInterface.dropTable('virtual_items');
  }
};
