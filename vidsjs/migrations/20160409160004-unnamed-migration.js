'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return [
            queryInterface.renameColumn('users_data', 'data', 'name'),
            queryInterface.addColumn('users_data', 'seen', Sequelize.INTEGER),
            queryInterface.addColumn('users_data', 'deleted', Sequelize.INTEGER),
            queryInterface.addColumn('users_data', 'parent', Sequelize.INTEGER),
            queryInterface.addColumn('users_data', 'type', Sequelize.INTEGER),
            queryInterface.addColumn('users_data', 'string', Sequelize.STRING)
        ];
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

    down: function (queryInterface, Sequelize) {
        return [
            queryInterface.renameColumn('users_data', 'name', 'data'),
            queryInterface.removeColumn('users_data', 'seen', Sequelize.INTEGER),
            queryInterface.removeColumn('users_data', 'deleted', Sequelize.INTEGER),
            queryInterface.removeColumn('users_data', 'parent', Sequelize.INTEGER),
            queryInterface.removeColumn('users_data', 'type', Sequelize.INTEGER),
            queryInterface.removeColumn('users_data', 'string', Sequelize.STRING)
        ];

    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
