'use strict';
module.exports = function(sequelize, DataTypes) {
    var users = sequelize.define('users', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: DataTypes.STRING,
        password: DataTypes.STRING,
        active: DataTypes.INTEGER,
        level: DataTypes.INTEGER
    }, {
    classMethods: {
            associate: function (models) {

        // associations can be defined here
      }
    }
  });
  return users;
};