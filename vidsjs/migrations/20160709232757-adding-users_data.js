'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('users_data', {
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
      pid: {
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

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:*/
    	return queryInterface.dropTable('users_data');
    
  }
};
